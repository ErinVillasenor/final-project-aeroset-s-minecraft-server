/*
 * Tristan Hilbert
 * 6/5/2020
 * User Model
 * 
 */

const { Assignment, Course } = require("./setup-db");
const { extractValidFields } = require("../lib/validation");


// SCHEMA
const AssignmentSchema = {
    points: { required: true },
    due: { required: true },
    courseid: { required: true },
}

module.exports.AssignmentSchema = AssignmentSchema

// READ
async function readAssignments(limit, offset){
    if(limit === undefined){
        const res = await Assignment.findAll();
        return res;
    }else{
        const res = await Assignment.findAll({
            limit: limit,
            offset: offset || 0,
        });

        return res;
    }
}

module.exports.readAssignments = readAssignments;


async function readAssignmentById(id){
    const res = await Assignment.findByPk(id);
    return res;
}

module.exports.readAssignmentById = readAssignmentById;

async function readAssignmentsByCourseId(id){
    const label = "IAmHappyToWorkWithSuchGreatPeople"
    const res = await Course.findByPk(id, {
        include: {
            model: Assignment,
            as: label,
        },
    });

    return res[label];
}

module.exports.readAssignmentsByCourseId = readAssignmentsByCourseId;

// CREATE
async function createAssignment(assignment){
    let insert = extractValidFields(assignment, AssignmentSchema);
    const res = await Assignment.create(insert);
    return res;
}

module.exports.createAssignment = createAssignment;

// UPDATE -- Works For Patch and Put
async function updateAssignmentById(id, assignment){
    let update = extractValidfields(assignment, AssignmentSchema);

    let assignmentInstance = await Assignment.findByPk(id);

    Object.keys(AssignmentSchema).forEach((field) => {
        assignmentIntance[field] = update[field];
    });

    await assignmentInstance.save();
    return assignmentInstance;
}

module.exports.updateAssignmentById = updateAssignmentById;


// DELETE
async function deleteAssignmentById(id){
    let assignmentInstance = await Assignment.findByPk(id);
    await assignmentInstance.destroy();

    return assignmentInstance;
}

module.exports.deleteAssignmentById = deleteAssignmentById;