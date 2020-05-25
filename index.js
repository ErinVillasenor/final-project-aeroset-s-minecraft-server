/*
 * Entry File For Tarpaulin API
 * This will use the src/ directory for
 * additional code
 */

const express = require("express");
const morgan = require("morgan");
const app = express();

//------ CONFIGURATION BASED ON ENV VARS ---------

const PRODUCTION_MODE = process.env.PRODUCTION_MODE || false;
const NODE_PORT = process.env.NODE_PORT || 8080;

//------------------------------------------------

//----- CONFIGURATION FOR EXPRESS JS -------------

// Logging Package with color
app.use(morgan('dev'));

// Use JSON bodies for request
app.use(express.json());

//------------------------------------------------

// Authentication
const auth = require("src/authentication/auth.js");
app.use("/", auth);


// Block Unauthenticated Paths
// https://stackoverflow.com/questions/14125997/difference-between-app-all-and-app-use
if(PRODUCTION_MODE !== false){
    app.all("*", (req, res, next) => {
        if(req.is_authenticated === undefined || req.is_authenticated === false){
            res.status(500).send({
                error: "Server Error! Please Try Again Later!"
            });
        }
    });
}else{
    console.log("== WARNING: PRODUCTION_MODE is Turned OFF!");
    console.log("== Some paths may be overlooked by authentication!");
}

// Routes
const routes = require("src/api/index.js");
app.use("/", routes);

// TURN OTHER BLOCKS ON HERE!
// i.e
// - SQL
// - MongoDB
// - Stream Service (https://nodejs.org/api/stream.html)

// Start Listening!
app.listen(NODE_PORT, () => {
    console.log("== Listening on Port 8080");
});