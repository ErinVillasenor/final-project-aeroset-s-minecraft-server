/*
 * Entry Point To Routes Block
 * 5/24/2020
 * 
 */

const router = require('express').Router();

 // ADD Paths Here!
 // router.use("/filename", require("filename"));
router.use('/assignments', require('./assignments'));
router.use('/courses', require('./courses'));
router.use('/users', require('./users'));

module.exports = router;