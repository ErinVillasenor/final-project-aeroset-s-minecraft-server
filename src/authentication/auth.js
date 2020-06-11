/*
 * Entrypoint to Authentication Block
 * 5/24/2020
 * 
 */

const express = require("express");
const router = express.Router();

const { readUserById } = require("../models/users");
const { readAssignmentById, readAssignmentByIdIncludeCourse } = require("../models/assignments");
const { readCourseById } = require("../models/courses");
const { readSubmissionById } = require("../models/submissions");

const {
    idFromToken,
    loginUser,
    hashUserPassword,
} = require("./auth-login");

const auth_config_json = require("./auth_config.json");
/*
 * Let's create a JSON file that stores
 * all the paths that need privaledges
 * and all the ones that do not.
 * 
 * Each one that has privaleges needs to
 * express where the id is that it can compare
 * against the token. 
 * 
 * WHITELIST:
 * -= "scheme": STRING FOR SCHEME
 * -= "endpoint": EXACT EXPRESS ROUTE
 * 
 * 
 * BLACKLIST:
 * -= "scheme": STRING FOR SCHEME
 * -= "endpoint": EXACT EXPRESS ROUTE
 * -= "role": ROLE in ["student", "instructor", "admin"]
 * -= "param": PARAMETER in Route that should be used for query
 * -= "body": BODY field that should be used for query
 * -= "res": {
 *        -=-= model: MODEL NAME from "src/models/" (may include . for includes)
 *        -=-= match: Field name in response from query to match with token/real user id
 *    }
 * ---------= OR =----------
 * -= "scheme": STRING FOR SCHEME
 * -= "endpoint": EXACT EXPRESS ROUTE
 * -= "role": ROLE in ["student", "instructor", "admin"]
 * -= "override": key for an override function because the JSON format is too simple
 * 
 * I think it would be nice to have an ERD transversal library rather than just an "ORM".
 * I think the ORM method could be adapted to this, but it needs help.
 * 
 * A thought for another project is seems.
 */

// No authentication needed -- public
const whitelist = auth_config_json.whitelist

// authentication needed -- private
const blacklist = auth_config_json.blacklist


/*
 *   --------------- FIRST TAKE CARE OF THE WHITELIST
 */
for(let i = 0; i < whitelist.length; i ++){
    // router.all might need to be replaced
    router[whitelist[i].scheme.toLowerCase()](whitelist[i].endpoint, (req, res, next) => {
        req.is_authenticated = true;
        next();
    });
}

// This includes login
router.post("/users/login", loginUser);
// see "auth-login"

/*
 *   --------------- NEXT ADD A ROUTE TO DEMISTIFY TOKENS
 */

async function getTrueUserId(req, res, next){
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');
    const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;
    if(token){
        let userid = idFromToken(token);
        if(userid !== undefined){
            req.trueUserId = userid;
        }else{
            req.is_authenticated = false;
        }
    }else{
        req.is_authenticated = false;
    }

    next();
}


 
/*
 *   --------------- AUTOMATICALLY TAKE CARE OF ANY ROLE REQUESTS FOR ADMIN
 */
async function checkForAdmin(req, blacklist_entry){
    if(req.trueUserId !== undefined){
        let res = await readUserById(req.trueUserId);
        if(res.role === "admin"){
            // Admin Check Confirmed -- User authenticated
            console.log("\n==Admin Confirmed!!");
            req.is_authenticated = true;
        }else{
            req.is_authenticated = false;
        }
    }
}

/*
 *   --------------- OVERRIDES to the JSON FORMAT
 */

async function authCheckSubmissionOwnership(req, blacklist_entry){
    // /assignments/:id/submissions
    const assignment_id = req.params.id;

    // Check for enrollment in the specified course.
    
    //* The cool thing is with Sequelize you can check for "has" within an instance.
    if(req.trueUserId){
        const assignment_res = await readAssignmentByIdIncludeCourse(id);
        if(assignment_res && assignment_res["course"]){
            let courseInstance = assignment_res["course"];
            
            // Now we can check if it has a student based on the id.
            // First get student
            let studentInstance = await readUserById(req.trueUserId)

            // Now use Sequelize function for has;

            let res = await courseInstance.hasStudent(studentInstance);
            if(res){
                req.is_authenticated = true;
            }else{
                req.is_authenticated = false;
            }
        }else{
            req.is_authenticated = false;
        }
    }else{
        req.is_authenticated = false;
    }
}


const overrides = {
    "student-submission" : authCheckSubmissionOwnership,
}


/*
 *   --------------- FINALLY TAKE CARE OF THE GENERAL CASE (QUERY AND MATCH ID)
 */

 // So we can use the same match function for everything
async function authAssignmentCourseStrip(id){
    const res = await readAssignmentByIdIncludeCourse(id);

    return res["courses"];
}


const modelsDictionary = {
    "users" : readUserById,
    "assignments" : readAssignmentById,
    "courses" : readCourseById,
    "submissions" : readSubmissionById,
    // Not really programmatic, but simpler with our setup
    "assignments.courses" : authAssignmentCourseStrip,
}

// Reminder
/*
 * -= "param": PARAMETER in Route that should be used for query
 * -= "body": BODY field that should be used for query
 * -= "res": {
 *        -=-= model: MODEL NAME from "src/models/" (may include . for includes)
 *        -=-= match: Field name in response from query to match with token/real user id
 *    }
 * ---------
 */

async function checkForOwnership(req, blacklist_entry){
    // Get Id
    let id = null;
    id = blacklist_entry.param !== "" ? req.params[blacklist_entry.param] : id;
    id = blacklist_entry.body !== "" ? req.body[blacklist_entry.body] : id;

    // Get Function for query
    if(req.trueUserId && id && blacklist_entry.res){
        let query = modelsDictionary[blacklist_entry.res.model];
        if(query === undefined){
            console.error("== Models Dictionary does not have " + blacklist_entry.res.model);
            throw Error("Undefined Model Function!");
        }

        const res = await query(id);

        if(res && res[blacklist_entry.res.match] === req.trueUserId){
            req.is_authenticated = true
        }else if(res && res[blacklist_entry.res.match] === undefined){
            console.error("== Field " + blacklist_entry.res.match + " does not exist in result");
            console.log(res);
            req.is_authenticated = false;
        }else{
            req.is_authenticated = false;
        }

    }else{
        req.is_authenticated = false;
    }
}

/*
 *   --------------- ATTACH THE MIDDLEWARES ABOVE
 */

async function checkForAll(req, blacklist_entry){
    if(blacklist_entry.override){
        await overrides[blacklist_entry.override](req, blacklist_entry);
    }else if(blacklist_entry.role === "admin"){
        await checkForAdmin(req, blacklist_entry);
    }else{
        await checkForOwnership(req, blacklist_entry);
    }
}

for(let i = 0; i < blacklist.length; i ++){
    router[blacklist[i].scheme.toLowerCase()](blacklist[i].endpoint, 
        getTrueUserId, 
        async function (req, res, next) {
            await checkForAll(req, blacklist[i]);
            next();
        });
}

/*
 *   --------------- OPTIMIZE ANY ROUTES OR HELPERS HERE (THE JSON METHOD IS NOT COMPLETELY UNIVERSAL)
 *   Note: These functions are independent of authorization. They just allow for certain functions to
 *         remain integorous. I.E. prevent a student from trying to submit under a different userid
 * 
 *   However, These should occur just after a user has been authorized so it will have:
 *     - req.trueUserId
 */

// User Submission
router.post("/assignments/:id/submissions", (req, res, next) => {
    req.body.studentId = req.trueUserId || req.body.studentId
    next();
});


// Admin User Register
router.post("/users", hashUserPassword);
// see auth-login.js

/*
 *   --------------- UNAUTHORIZE ALL PROPOGATED BLACKLIST REQUESTS
 */

for(let i = 0; i < blacklist.length; i ++){
    router[blacklist[i].scheme.toLowerCase()](blacklist[i].endpoint, (req, res, next) => {
        if(req.is_authenticated === false){
            res.status(403).send({
                error: "Unauthorized!",
            })
        }else if(req.is_authenticated === undefined){
            // Book keeping for erroneous behavior. Every path in blacklist should have a finished request
            console.log("== The Url [" + req.originalUrl + "] did not finish authenticating.");
            console.log("== This will result as an error in production!");
            next();
        }else{
            next();
        }
    });
}


module.exports = router;



/*
 * TODO Small bug
 * The only thing not handled here is role acquisition. This would require the 
 * matching of roles to students. This is a small erroneous case that actually
 * may hurt more than help. Consider student teachers or TAs. Essentially, this
 * todo stands for role checking according to blacklist entries. If the role of 
 * the user found by a PK query into users shows a discrepency in the roles, then
 * the api should return an unauthorized response. However, in many cases this
 * is circumvented with the way the database is setup where only instructors can
 * own a class. The only time the role is checked is for admin usage. Since none of
 * the paths require an instructor role and nothing else, this should not change the
 * output based on the given routes. 
 * 
 */