/*
 * Tristan Hilbert
 * 6/6/2020
 * Utility Functions for Debugging and Testing
 * 
 *
 */

const fs = require("fs")
//https://nodejs.org/en/knowledge/command-line/how-to-prompt-for-command-line-input/
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function verifyLogDirectory(){
    if(!fs.existsSync("./logs")){
        fs.mkdirSync("./logs");
    }
}


function outputToLogs(obj, path){
    var contents = JSON.stringify(obj, null, 4);
    verifyLogDirectory();
    fs.writeFileSync("./logs/" + path, contents);
}

module.exports.outputToLogs = outputToLogs;

// Returns a promise that resolves if the user say something like
// yes to the question prompt.
function promptForYes(questionPrompt){
    return new Promise((resolve, reject) => {
        try{
            rl.question(questionPrompt, (answer) => {
                answer = answer.toLowerCase();
                let isYes = answer == "yes" || (answer.includes("y") && !answer.includes("n"));
                resolve(isYes);
            });
        }catch (err){
            reject(err);
        }
    });
}

module.exports.promptForYes = promptForYes;