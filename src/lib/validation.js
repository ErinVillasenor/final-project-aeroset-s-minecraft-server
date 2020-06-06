/*
 * Tristan Hilbert
 * 6/5/2020
 * Validation JS
 * 
 * Based on Rob Hess' Code from CS493
 * Oregon State University
 */

// returns true on a good schema
function validateAgainstSchema(obj, schema){
    Object.keys(schema).forEach( (field) => {
        if(schema[field].required && obj[field] === undefined){
            return false;
        }
    });

    return true;
}

module.exports.validateAgainstSchema = validateAgainstSchema;


// Returns an object with only valid fields
function extractValidFields(obj, schema){
    let res = {}
    Object.keys(shema).forEach((field) => {
        res[field] = obj[field];
        // schema[field] may be undefined
    });

    return res;
}

module.exports.extractValidFields = extractValidFields;