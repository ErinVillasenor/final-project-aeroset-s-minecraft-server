/*
 * Tristan Hilbert
 * 6/6/2020
 * Submissions Modle
 * 
 */

const { Submission, Assignment } = require("./setup-db");
const { extractValidFields } = require("../lib/validation");

// Submission Schema
const SubmissionSchema = {
    assignmentid: { required: true },
    studentid: { required: true },
    timestamp: { required: false },
    file: { required: true }
}

// READ
async function readSubmissions(limit, offset){
    if(limit === undefined){
        const res = await Submission.findAll();
        return res;
    }else{
        const res = await Submission.findAll({
            limit: limit,
            offset: offset || 0,
        });

        return res;
    }
}

module.exports.readSubmissions = readSubmissions;

async function readSubmissionById(id){
    const res = await Submission.findByPk(id);

    return res;
}

module.exports.readSubmissionById = readSubmissionById;


async function readSubmissionsByAssignmentId(assignmentid){
    const res = await Assignment.findByPk(assignmentid,{
        include: Submission
    });

    return res["Submissions"];
}

module.exports.readSubmissionsByAssignmentId = readSubmissionsByAssignmentId;

// Create
async function createSubmission(submission){
    let insert = extractValidFields(submission, SubmissionSchema);

    const res = await Submission.create(insert);

    return res;
}

module.exports.createSubmission = createSubmission;

// Update
async function updateSubmission(id, submission){
    let update = extractValidFields(submission, SubmissionSchema);

    let submissionInstance = await Submission.findByPk(id);
    if(submissionInstance === null){
        return null;
    }

    Object.keys(SubmissionSchema).forEach((field) => {
        submissionInstance[field] = update[field] || submissionInstance[field];
    });

    await submissionInstance.save();
    return submissionInstance;
}

module.exports.updateSubmission = updateSubmission;


// Delete
async function deleteSubmission(id){
    let submissionInstance = await Submission.findByPk(id);
    if(submissionInstance === null){
        return null;
    }

    await submissionInstance.destroy();

    return submissionInstance;
}

module.exports.deleteSubmission = deleteSubmission;