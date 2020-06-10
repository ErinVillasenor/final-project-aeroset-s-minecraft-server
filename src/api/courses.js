//Work in Progress Max Evdemon
const router = require('express').Router();
const CSV = require('csv-writer').createObjectCsvWriter;
const CSVSTR = require('csv-writer').createObjectCsvStringifier;
const fs = require('fs');
const { validateAgainstSchema } = require('../lib/validation');

const { CourseSchema, readCourses, createCourse, readCourseById, updateCourseById, deleteCourseById, readCoursesParams } = require('../models/courses');
const { readStudentsByCourseId, addStudentsToCourse, removeStudentsFromCourse } = require('../models/users');
const { readAssignmentsByCourseId } = require('../models/assignments');


//This one shouldn't need authroization, should be done
router.get('/', async (req, res) => {
  try {
    const result = await readCoursesParams(undefined,undefined, req.query.subject || undefined, req.query.number || undefined, req.query.term || undefined, parseInt(req.query.page) || 1,0);
    //The following code block idea is modification of code taken from CS 493 spring term's pagination example
    result.links = {};
    if (result.page < result.totalPages) {
      var str = `/courses?page=${result.page + 1}`;
      var str2 = `/courses?page=${result.totalPages}`;
      if(req.query && req.query.subject){
        str = str + "&subject=" + req.query.subject;
        str2 = str2 + "&subject=" + req.query.subject;
      }
      if(req.query && req.query.number){
        str = str + "&number=" + req.query.number;
        str2 = str2 + "&number=" + req.query.number;
      }
      if(req.query && req.query.term){
        str = str + "&term=" + req.query.term;
        str2 = str2 + "&term=" + req.query.term;
      }
      result.links.nextPage = str;
      result.links.lastPage = str2;
    }
    if (result.page > 1) {
      var str = `/courses?page=${result.page - 1}`;
      var str2 = '/courses?page=1';
      if(req.query && req.query.subject){
        str = str + "&subject=" + req.query.subject;
        str2 = str2 + "&subject=" + req.query.subject;
      }
      if(req.query && req.query.number){
        str = str + "&number=" + req.query.number;
        str2 = str2 + "&number=" + req.query.number;
      }
      if(req.query && req.query.term){
        str = str + "&term=" + req.query.term;
        str2 = str2 + "&term=" + req.query.term;
      }
      result.links.prevPage = str;
      result.links.firstPage = str2;
    }
    //block end
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error getting Courses from DB. Please try again later."
    });
  }
});

//Needs Authorization implementation still 
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, CourseSchema)) {
    try {
      console.log(req.body.file);
      const result = await createCourse(req.body);
      res.status(201).send({
        id: result.id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting Course into DB. Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid Course object."
    });
  }
});

 
router.get('/:id', async (req, res) => {
  try {
    const result = await readCourseById(req.params.id);
    if(result){
      res.status(200).send(result);
    } else {
      res.status(404).send({
	    err: "Requested resource " + req.originalUrl + " does not exist"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error getting Course from DB.  Please try again later."
    });
  }
});

//Needs Authorization implementation still 
router.patch('/:id', async (req, res) => {
  if (req.body && (req.body.subject || req.body.number || req.body.title || req.body.term || req.body.instructorid)) {
    try {
      console.log(req.body.file);
      const result = await updateCourseById(req.params.id,req.body);
      if (result){
        res.status(200).send("Success");
      } else {
        res.status(404).send({
	      err: "Requested resource " + req.originalUrl + " does not exist"
        });  
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error updating assignment in DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a does not have any valid course objects."
    });
  }
});

//Needs Authorization implementation still 
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteCourseById(req.params.id);
    if(result){
      res.status(200).send("Success");
    } else {
      res.status(404).send({
	    err: "Requested resource " + req.originalUrl + " does not exist"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error deleting course from DB. Please try again later."
    });
  }
});

//Needs Authorization implementation still NEEDS ADMIN just the IDS of the students
router.get('/:id/students', async (req, res) => {
  try {
    const exist = await readCourseById(req.params.id);
    if(exist){
      const result = await readStudentsByCourseId(req.params.id);
      var listids = [];
      var i;
      console.log(result.length);
      for(i=0;i<result.length;i++){
        listids[i] = result[i].id;
      }
      res.status(200).send({ students: listids});
    } else {
      res.status(404).send({
	    err: "Requested resource " + req.originalUrl + " does not exist"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error getting students from DB.  Please try again later."
    });
  }
});

//Needs Authorization implementation still NEEDS ADMIN 
router.post('/:id/students', async (req, res) => {
  if(req.body && (req.body.add || req.body.remove)){
    try {
      const exist = await readCourseById(req.params.id);
      if(exist){
        
        if(req.body.add){
          const result = await addStudentsToCourse(req.params.id, req.body.add);
        }
        if(req.body.remove){
          const result2 = await removeStudentsFromCourse(req.params.id, req.body.remove);
        }
        res.status(200).send("Success");
      } else {
        res.status(404).send({
	      err: "Requested resource " + req.originalUrl + " does not exist"
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error posting to CourseToStudent DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a does not have a remove or add array."
    });
  }
});

//Needs Authorization implementation still NEEDS ADMIN 
router.get('/:id/roster', async (req, res) => {
  try {
    const exist = await readCourseById(req.params.id);
    if(exist){
      const result = await readStudentsByCourseId(req.params.id);
      var listids = [];
      var i;
      console.log(result.length);
      //The following CSV formatting was modfied from https://www.npmjs.com/package/csv-writer
      const CSVSTRING = CSV({
        path: './src/api/temp.csv',
        header: [
            {id: 'id', title: 'id'},
            {id: 'name', title: 'name'},
            {id: 'email', title: 'email'}
        ]
      });
      await CSVSTRING.writeRecords(result); 
      res.status(200).sendFile(`./temp.csv`, { root : './src/api'});
      //fs.unlinkSync('./src/api/temp.csv');
    } else {
      res.status(404).send({
	    err: "Requested resource " + req.originalUrl + " does not exist"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error getting CSV for students from DB.  Please try again later."
    });
  }
});

//Needs Authorization implementation still NEEDS ADMIN returns IDS of all assignments associated with courses.
router.get('/:id/assignments', async (req, res) => {
  try {
    const exist = await readCourseById(req.params.id);
    if(exist){
      const result = await readAssignmentsByCourseId(req.params.id);
      var listids = [];
      var i;
      console.log(result.length);
      for(i=0;i<result.length;i++){
        listids[i] = result[i].id;
      }
      res.status(200).send({AssignmentIds: listids});
    } else {
      res.status(404).send({
	    err: "Requested resource " + req.originalUrl + " does not exist"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error getting students from DB.  Please try again later."
    });
  }
});



router.use('*', (req, res, next) => {
  res.status(404).send({
	err: "Requested resource " + req.originalUrl + " does not exist"
  });
});

module.exports = router;
