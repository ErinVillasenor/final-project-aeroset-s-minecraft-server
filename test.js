/* 
 * 6/6/2020
 * Testing Code For Tarpaulin API
 * 
 */

// Testing Database
const { populateDatabase, testDatabase } = require("./src/models/test-data");
const { promptForYes } = require("./src/lib/debug");

// https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}   

async function startTests(){
    // Setup Stuff
    await populateDatabase(); 

    console.log("When the server has started.\n\t\t Type a yes like response");
    await sleep(5000);
    // Start Server
    require("./index");

    const shouldTest = await promptForYes("Ready to Start?");
    if(shouldTest){
        await testDatabase();
    }
}

try{
    startTests().then(() => {
        process.exit(0);
    });
} catch(err) {
    console.log("Tests Failed!");
    console.error(err);
    process.exit(1);
}

