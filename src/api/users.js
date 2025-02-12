const app = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
//const { UserSchema, insertNewUser, getUserById, validateUser} = require('./models/users');
 const { UserSchema, readUsers, readUserById, readUsersByRole, readUserByEmail, readStudentsByCourseId, readInstructorByCourseId,
  createUser, updateUserById,addStudentsToCourse, removeStudentsFromCourse,
   addCoursesToInstructor, deleteUserById} = require('../models/users');
const { readCoursesByInstructorId, readCoursesByUserId } = require("../models/courses");

app.post('/', async (req, res) => { //Still needs "Only an authenticated admin can add admin or instructor roles"
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      const id = await createUser(req.body);
      res.status(201).send({success: "New user successfully added", //possibly broken?
        _id: id
      });
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain a valid User object."
    });
  }
});

app.get('/:id', async (req, res, next) => {//requireAuthentication, async (req, res, next) => {
/*  if (req.user !== req.params.id) {
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  } else {*/
    try {
      let user = await readUserById(req.params.id);

      if(user.role === "student"){
        user.courses = await readCoursesByUserId(req.params.id);
      }else{
        user.courses = await readCoursesByInstructorId(req.params.id);
      }

      if (user) {
        res.status(200).send(user);
      } else {
      res.status(404).send({err: "Specified User 'id' not found"});
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
//  }
});

app.post('/login', async (req, res) => {
  if (req.body && req.body.id && req.body.password) {
    try {
      const authenticated = await validateUser(
        req.body.id,
        req.body.password
      );
      if (authenticated) {
        const token = generateAuthToken(req.body.id);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error:  "The specified credentials were invalid."
        })
      }
    } catch (err) {
      console.error("  -- error:", err);
      res.status(500).send({
        error: "An internal server error occurred."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain all of the required fields."
    });
  }
});

module.exports = app;