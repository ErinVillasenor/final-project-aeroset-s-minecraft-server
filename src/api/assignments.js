//Work in Progress Max Evdemon
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');

const { readAssignmentById, AssignmentSchema, createAssignment, updateAssignmentById, deleteAssignmentById, readAssignments } = require('../models/assignments');

const { createSubmission, readSubmissionsByAssignmentId, readSubmissionsByAID, readSubmissions } = require('../models/submissions');
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
//Following upload setup is from the File handling and upload section of CS 493 Spring 2020
const upload = multer({ 
  storage: multer.diskStorage({
	destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
       const filename = crypto.pseudoRandomBytes(16).toString('hex');
       const extension = path.extname(file.originalname);
       callback(null, `${filename}${extension}`);
    }
  })
});
//end 

const SubmissionSchema = {
    assignmentid: { required: true },
    studentid: { required: true },
    timestamp: { required: false },
    file: { required: true }
}

//the following still need authorization to be finished

router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      console.log(req.body.file);
      const result = await createAssignment(req.body);
      res.status(201).send({
        id: result.id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting assignment into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid Assignment object."
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await readAssignmentById(req.params.id);
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
      error: "Error getting assignment from DB.  Please try again later."
    });
  }
});

//Needs Authorization implementation still 
router.patch('/:id', async (req, res) => {
  if (req.body && (req.body.title || req.body.courseid || req.body.due || req.body.points)) {
    try {
      console.log(req.body.file);
      const result = await updateAssignmentById(req.params.id,req.body);
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
      error: "Request body is not a does not have any valid Assignment objects."
    });
  }
});

//Needs Authorization implementation still 
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteAssignmentById(req.params.id);
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
      error: "Error getting assignment from DB.  Please try again later."
    });
  }
});


//For Posting a new submission, working on implementation, no authorization yet, no file upload still thinking on it

router.post('/:id/submissions', upload.single('file'), async (req, res) => {
  console.log(req.file);
  var infohold = [];
  infohold.studentid = req.body.studentid;
  infohold.assignmentid = req.params.id;
  infohold.file = req.file.filename;
  if(req.body.timestamp){
    infohold.timestamp = req.body.timestamp;
  }
  const exist = await readAssignmentById(req.params.id);
  if (exist){
    if (validateAgainstSchema(infohold, SubmissionSchema)) {
      try {
        const result = await createSubmission(infohold);
        res.status(201).send({
          id: result.id,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting submission into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid submission object."
      });
    }
  } else{
    res.status(404).send({
	  err: "Requested resource " + req.originalUrl + " does not exist"
    });
  }
});


//Needs some Auth I think
router.get('/:id/submissions', async (req, res) => {
  try {
    const exist = await readAssignmentById(req.params.id);
    if(exist){
      const result = await readSubmissionsByAID(undefined,undefined, req.params.id, req.query.studentid || undefined, parseInt(req.query.page) || 1,0);
      if (result){
        var i;
        console.log(result.Submissions.length);
        for(i = 0; i < result.Submissions.length;i++){
          result.Submissions[i].file = `/assignments/submissions/${result.Submissions[i].file}`
          console.log(result.Submissions[i].file);
        }
        //The following code block idea is modification of code taken from CS 493 spring term's pagination example
        result.links = {};
        if (result.page < result.totalPages) {
          var str = `/assignments/${req.params.id}/submissions?page=${result.page + 1}`;
          var str2 = `/assignments/${req.params.id}/submissions?page=${result.totalPages}`;
          if(req.query && req.query.studentid){
            str = str + "&studentid=" + req.query.studentid;
            str2 = str2 + "&studentid=" + req.query.studentid;
           }
          result.links.nextPage = str;
          result.links.lastPage = str2;
        }
        if (result.page > 1) {
          var str = `/assignments/${req.params.id}/submissions?page=${result.page - 1}`;
          var str2 = `/assignments/${req.params.id}/submissions?page=1`;
          if(req.query && req.query.studentid){
            str = str + "&studentid=" + req.query.studentid;
            str2 = str2 + "&studentid=" + req.query.studentid;
          }
          result.links.prevPage = str;
          result.links.firstPage = str2;
        }
        //block end
        res.status(200).send(result);
      } else {
        res.status(404).send({
	      err: "Requested resource " + req.originalUrl + " does not exist"
        });
      }
    } else {
      res.status(404).send({
	    err: "Requested resource " + req.originalUrl + " does not exist"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error getting assignment submissions from DB.  Please try again later."
    });
  }
});

/*
router.get('/submissions/:filename', async (req, res) => {
  try {
    res.status(200).send();
  } catch (err) {
    res.status(404).send({
	  err: "Requested resource " + req.originalUrl + " does not exist"
    });
  }
});
*/
//Following code block format comes from CS 493 Spring Term File management and upload notes
router.use('/submissions', express.static(`${__dirname}/uploads`)
);
// end block

router.use('*', (req, res, next) => {
  res.status(404).send({
	err: "Given Link Does not exist"
  });
});

module.exports = router;
