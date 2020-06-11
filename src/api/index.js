/*
 * Entry Point To Routes Block
 * 5/24/2020
 * 
 */

 const express = require("express");

 const router = express.Router();

 // ADD Paths Here!
 // router.use("/filename", require("filename"));
router.use('/users', require('./users'));

 module.exports = router;