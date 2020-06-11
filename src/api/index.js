/*
 * Entry Point To Routes Block
 * 5/24/2020
 * 
 */

 const express = require("express");

 const router = express.Router();

router.use('/assignments', require('./assignments'));

 // ADD Paths Here!
 // router.use("/filename", require("filename"));
router.use('/users', require('./users'));
router.use('/redis', require('./redis'));
 module.exports = router;