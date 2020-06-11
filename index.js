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

// Rate Limiting
const rl = require("./src/limit/redis");
app.use("/", rl);

// Authentication
const auth = require("./src/authentication/auth.js");
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

    next();
}else{
    console.log("== WARNING: PRODUCTION_MODE is Turned OFF!");
    console.log("== Some paths may be overlooked by authentication!");
}

// Routes
const routes = require("./src/api/index.js");
app.use("/", routes);

// Error Handling Route
app.use(function(err, req, res, next){
    console.error(err);
    res.status(500).send({
        error: "Cannot complete operation right now. Try again later!",
    })
});

/* Magical 404 */

app.use("*", (req, res, next) => {
    res.status(404).send({
        error: "Route Not Found!",
    });
});

// TURN OTHER BLOCKS ON HERE!
// i.e
// - SQL ./
// - MongoDB
// - Stream Service (https://nodejs.org/api/stream.html)

const { initDB } = require("./src/models/setup-db");
const { forcePopulateDatabase } = require("./src/models/test-data");

// Start Listening!
async function startup(){
    try{
        await initDB();
        await forcePopulateDatabase();
        // https://medium.com/javascript-in-plain-english/converting-javascript-callbacks-to-promise-and-async-await-replacing-async-waterfall-method-with-3c8b7487e0b9
        const listenPromise = new Promise((resolve, reject) =>{
            try{
                app.listen(NODE_PORT, () => {
                    resolve();
                });
            }catch(err){
                reject(err);
            }
        });

        await listenPromise.then(() => {
            console.log("== Listen Promise Resolved!");
        });
    

    }catch(err){
        console.error(err);
        console.log("== FATAL ERROR: Shutting Down!");
        process.exit(1);
    }
}

startup().then(() => {
    console.log("== Listening on Port " + NODE_PORT);
});
