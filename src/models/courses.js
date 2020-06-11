/*
 * Tristan Hilbert
 * 6/6/2020
 * Courses Model
 * 
 */

const { Course, User } = require("./setup-db");
const { extractValidFields } = require("../lib/validation");

// Schema
const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorid: {required: true},
}

module.exports.CourseSchema = CourseSchema;

// READ
async function readCourses(limit, offset){
    if(limit === undefined){
        const res = await Course.findAll();
        return res;
    }else{
        const res = await Course.findAll({
            limit: limit,
            offset: offset || 0,
        });

        return res;
    }
}

module.exports.readCourses = readCourses;

async function readCoursesParams(limit, offset, subject, number, term, page, org){
    var res;
    if(limit === undefined){
         if(subject === undefined && number === undefined && term === undefined){
          res = await Course.findAll();
        }
        else if(subject !== undefined && number === undefined && term === undefined){
          res = await Course.findAll({
              where: {
                 subject: subject
              }
          });
        }
        else if(subject === undefined && number !== undefined && term === undefined){
          res = await Course.findAll({
              where: {
                 number: number
              }
          });
        }
        else if(subject === undefined && number === undefined && term !== undefined){
          res = await Course.findAll({
              where: {
                 term: term
              }
          });
        }
        else if(subject !== undefined && number !== undefined && term === undefined){
          res = await Course.findAll({
              where: {
                 number: number,
                 subject: subject
              }
          });
        }
        else if(subject !== undefined && number === undefined && term !== undefined){
          res = await Course.findAll({
              where: {
                 subject: subject,
                 term: term
              }
          });
        }
        else if(subject === undefined && number !== undefined && term !== undefined){
          res = await Course.findAll({
              where: {
                 number: number,
                 term: term
              }
          });
        }
        else if(subject !== undefined && number !== undefined && term !== undefined){
          res = await Course.findAll({
              where: {
                 number: number,
                 term: term,
                 subject: subject
              }
          });
        }
        if(org == 0){ 
          try{
            const count = res.length
            //Code block format taken from CS 493 Spring term pagination examples
            const pageSize = 3;
            const lastPage = Math.ceil(count / pageSize);
            page = page > lastPage ? lastPage : page;
            page = page < 1 ? 1 : page;
            const Poffset = (page - 1) * pageSize;
            //end of block   
            const results = await readCoursesParams(pageSize, Poffset, subject, number, term, page, 1);      
            //Return format taken from CS 493 Spring term pagination examples
            return {
              Courses: results,
              page: page,
              totalPages: lastPage,
              pageSize: pageSize,
              count: count
            };  
          } catch (err) {
            console.log("ERROR IN SECOND HALF OF GET");
            console.log(err);
            return res;
          }        
        }
        return res;
    }else{
        if(subject === undefined && number === undefined && term === undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
          });
        }
        else if(subject !== undefined && number === undefined && term === undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 subject: subject
              }
          });
        }
        else if(subject === undefined && number !== undefined && term === undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 number: number
              }
          });
        }
        else if(subject === undefined && number === undefined && term !== undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 term: term
              }
          });
        }
        else if(subject !== undefined && number !== undefined && term === undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 number: number,
                 subject: subject
              }
          });
        }
        else if(subject !== undefined && number === undefined && term !== undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 subject: subject,
                 term: term
              }
          });
        }
        else if(subject === undefined && number !== undefined && term !== undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 number: number,
                 term: term
              }
          });
        }
        else if(subject !== undefined && number !== undefined && term !== undefined){
          res = await Course.findAll({
              limit: limit,
              offset: offset || 0,
              where: {
                 number: number,
                 term: term,
                 subject: subject
              }
          });
        }      
        return res;
    }
}

module.exports.readCoursesParams = readCoursesParams;




async function readCourseById(id){
    const res = await Course.findByPk(id);
    return res;
}

module.exports.readCourseById = readCourseById;


// CREATE
async function createCourse(course){
    let insert = extractValidFields(course, CourseSchema);

    const res = await Course.create(insert);

    return res;
}

module.exports.createCourse = createCourse;


// Update
async function updateCourseById(id, course){
    let update = extractValidFields(course, CourseSchema);

    let courseInstance = await Course.findByPk(id);
    if(courseInstance === null){
        return null;
    }

    Object.keys(CourseSchema).forEach((field) => {
        courseInstance[field] = update[field] || courseInstance[field];
    });

    await courseInstance.save();
    return courseInstance;
}

module.exports.updateCourseById = updateCourseById;

// Not super necessary, but fun
async function updateCourseInstructorById(courseid, instructorid){
    let courseInstance = await Course.findByPk(courseid);
    if(courseInstance === null){
        return null;
    }

    let userInstance = await User.findByPk(instructorid);

    await courseInstance.setInstructor(userInstance);

    return courseInstance;
}

module.exports.updateCourseInstructorById = updateCourseInstructorById;

// DELETE
async function deleteCourseById(id){
    let courseInstance = await Course.findByPk(id);
    if(courseInstance === null){
        return null;
    }

    await courseInstance.destroy();

    return courseInstance;
}

module.exports.deleteCourseById = deleteCourseById;