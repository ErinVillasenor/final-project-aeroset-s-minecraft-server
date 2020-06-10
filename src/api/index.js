/*
 * Entry Point To Routes Block
 * 5/24/2020
 * 
 */

 const express = require("express");

 const router = express.Router();

router.use('/assignments', require('./assignments'));
router.use('/courses', require('./courses'));

 // ADD Paths Here!
 // router.use("/filename", require("filename"));

 module.exports = router;