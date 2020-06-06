/*
 * Tristan Hilbert
 * Testing Data For Database
 * 
 */

const {
    User,
    Submission,
    Course,
    Assignment,
    initDB,
} = require("./setup-db");

const data = require("../../data/test-data.json");

var users = null;
var assignments = null;
var courses = null;
var submissions = null;


async function populateDatabase(){
    await initDB();

    try{
        users = await User.bulkCreate(data.users);
        assignments = await Assignment.bulkCreate(data.assignments);
        courses = await Course.bulkCreate(data.courses);
        submissions = await Submission.bulkCreate(data.submissions);

        // console.log(users.toString());
        // console.log(assignments.toString());
        // console.log(courses.toString());
        // console.log(submissions.toString());
    }catch(err){
        console.log(err);
        console.log("== Could not populate Database!")
    }
}

module.exports.populateDatabase = populateDatabase;


async function testDatabase(){
    console.log("This is Tristan's test KAWAIIII");
}

module.exports.testDatabase = testDatabase;