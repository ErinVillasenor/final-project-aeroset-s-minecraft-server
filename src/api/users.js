
const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { UserSchema, insertNewUser, getUserById, validateUser} = require('../models/users');


router.post('/', async (req, res) => { //Still needs "Only an authenticated admin can add admin or instructor roles"
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      const id = await insertNewUser(req.body);
      res.status(201).send({/*'New user successfully added'*/
        id: id
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

router.get('/:id', async (req, res, next) => {//requireAuthentication, async (req, res, next) => {
/*  if (req.user !== req.params.id) {
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  } else {*/
    try {
      const user = await getUserById(req.params.id);
      if (user) {
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
//  }
});

module.exports = router;