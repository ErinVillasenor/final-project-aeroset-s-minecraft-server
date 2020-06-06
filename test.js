/* 
 * 6/6/2020
 * Testing Code For Tarpaulin API
 * 
 */

// Testing Database
const { populateDatabase, testDatabase } = require("./src/models/test-data");


async function startTests(){
    // Setup Stuff
    await populateDatabase(); 

    // Start Server
    require("./index");

    // Run Tests
    await testDatabase();

}

try{
    startTests().then(() => {
        process.exit(0);
    });
} catch(err) {
    console.log("Tests Failed!");
    throw err;
}

