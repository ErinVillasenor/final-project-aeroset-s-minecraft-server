//Work in Progress Max Evdemon
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');

const { readAssignmentById, AssignmentSchema, createAssignment, updateAssignmentById, deleteAssignmentById } = require('../models/assignments');

const { createSubmission } = require('../models/submissions');

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

router.post('/:id/submissions', async (req, res) => {
  const exist = await readAssignmentById(req.params.id);
  if (exist){
    if (validateAgainstSchema(req.body, SubmissionSchema)) {
      try {
        console.log(req.body.file);
        const result = await createSubmission(req.body);
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


//Not done or correct, might be failing to understand SQL functions, but may need a function that does not exist, will ask tomorrow and make it if needed
router.get('/:id/submissions', async (req, res) => {
  try {
    const result = await readAssignmentById(req.params.id);
    if (result){
      res.status(200).send(result);
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

router.use('*', (req, res, next) => {
  res.status(404).send({
	err: "Given Link Does not exist"
  });
});

module.exports = router;
