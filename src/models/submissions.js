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

async function readSubmissionsByAID(limit, offset, assignmentid, sid, page, org){
  var res = [];
  if (limit === undefined){
      if (sid === undefined){
        res = await Submission.findAll({
          where: {
               assignmentid: assignmentid
          }
        });
      }
      else if(sid !== undefined){
        res = await Submission.findAll({
          where: {
               assignmentid: assignmentid,
               studentid: sid
          }
        });
      }
      if(org == 0){ 
        try{
          const count = res.length;
          //Code block format taken from CS 493 Spring term pagination examples
          const pageSize = 2;
          const lastPage = Math.ceil(count / pageSize);
          page = page > lastPage ? lastPage : page;
          page = page < 1 ? 1 : page;
          const Poffset = (page - 1) * pageSize;
          //end of block   
          const results = await readSubmissionsByAID(pageSize, Poffset, assignmentid, sid, page, 1);      
          //Return format taken from CS 493 Spring term pagination examples
          return {
            Submissions: results,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
          };  
        } catch (err) {
           console.log("ERROR IN SECOND HALF OF GET");
           console.log(err);
           return res;
        }        
      }
      return res;
  } else{
      if(sid === undefined){
        res = await Submission.findAll({
          limit: limit,
          offset: offset || 0,
          where: {
             assignmentid: assignmentid
          }
        });
      }
      else if(sid !== undefined){
        res = await Submission.findAll({
          limit: limit,
          offset: offset || 0,
          where: {
               assignmentid: assignmentid,
               studentid: sid
          }  
        });
      }
      return res;
    }
}

module.exports.readSubmissionsByAID = readSubmissionsByAID;



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