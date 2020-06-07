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
    db,
} = require("./setup-db");

const data = require("../../data/test-data.json");

const DBModels = {
    Users : require("./users"),
    Courses : require("./courses"),
    Assignments : require("./assignments"),
    Submissions : require("./submissions"),
}

// Logging Utility
const { outputToLogs, promptForYes } = require("../lib/debug");

var users = null;
var assignments = null;
var courses = null;
var submissions = null;

var shouldTestDatabase = false;


async function populateDatabase(){
    try{
        shouldTestDatabase = await promptForYes("=-= The database needs to be empty to test.\n=-= Can we clear the SQL database?");
        if(shouldTestDatabase){
            await db.drop();
            await initDB();
        }

        if(shouldTestDatabase || await promptForYes("=-= Add Duplicate Values anyways?\n")){
            shouldTestDatabase = true;
            users = await User.bulkCreate(data.users);
            assignments = await Assignment.bulkCreate(data.assignments);
            courses = await Course.bulkCreate(data.courses);
            submissions = await Submission.bulkCreate(data.submissions);
        }

    }catch(err){
        console.log(err);
        console.log("== Could not populate Database!")
    }
}

module.exports.populateDatabase = populateDatabase;


async function testDatabase(){
    try{
        if(shouldTestDatabase || await promptForYes("=-= Run Database Tests Anyways?\n")){
            const dbTests = require("../../data/db-tests.json");
            let loggedTests = [];
            let test = null;
            for(let index = 0; index < dbTests.length; index ++){
                test = dbTests[index];
                let module = DBModels[test.module];
                let res = await module[test.function](test.args[0], test.args[1], test.args[2], test.args[3]);
                console.log("== Test Ran and Logged!");
                console.log(test.name + "\n");
                loggedTests.push({
                    number: index,
                    name: test.name,
                    result: res,
                });
            }
            console.log("Tests Ran: " + loggedTests.length);
            if(loggedTests.length > 0){
                outputToLogs(loggedTests, "dbTests.json");
            }
        }
    }catch(err){
        return err;
    }
}

module.exports.testDatabase = testDatabase;