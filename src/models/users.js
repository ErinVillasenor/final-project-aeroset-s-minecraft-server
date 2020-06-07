/*
 * Tristan Hilbert
 * 6/5/2020
 * User Model
 * 
 */

const { User, Course } = require("./setup-db");
const { extractValidFields } = require("../lib/validation");


// SCHEMA
const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: { required: false }
}

module.exports.UserSchema = UserSchema

// READ
// Limit -- Number of Users
// offset -- Number of Users to paginated
async function readUsers(limit, offset){
    if(limit === undefined){
        const res = await User.findAll();
        return res;
    }else{
        const res = await User.findAll({
            limit: limit,
            offset: offset || 0,
        });

        return res;
    }
}

module.exports.readUsers = readUsers;

async function readUserById(id){
    const res = await User.findByPk(id);
    return res;
}

module.exports.readUserById = readUserById;

const roles = ["student", "instructor", "admin"];
async function readUsersByRole(role){
    if(!roles.includes(role)){
        throw Error("Role does not exist for Users!");
    }

    const res = await User.findAll({
        where:{
            role: role
        }
    });

    return res;
}

module.exports.readUsersByRole = readUsersByRole;

async function readUserByEmail(email){
    const res = await User.findOne({
        where: {
            email: email
        }
    });

    return res;
}

module.exports.readUserByEmail = readUserByEmail;

async function readStudentsByCourseId(courseid){
    const res = await Course.findByPk(courseid, {
        include: {
            model: User,
            as: "student"
        }
    });

    return res.student;
}

module.exports.readStudentsByCourseId = readStudentsByCourseId;

async function readInstructorByCourseId(courseid){
    const res = await Course.findByPk(courseid, {
        include: {
            model: User,
            as: "instructor"
        }
    });

    return res.instructor;
}

module.exports.readInstructorByCourseId = readInstructorByCourseId;

// CREATE
async function createUser(user){
    let insert = extractValidFields(user, UserSchema);
    const res = await User.create(insert);
    return res;
}

//  https://sequelize.org/master/manual/model-querying-basics.html

module.exports.createUser = createUser;

// UPDATE -- Works For Patch and Put
async function updateUserById(id, user){
    let update = extractValidFields(user, UserSchema);

    let userInstance = await User.findByPk(id);
    if(userInstance === null){
        return null;
    }

    Object.keys(UserSchema).forEach((field) => {
        userInstance[field] = update[field] || userInstance[field];
    });

    await userInstance.save();
    return userInstance;
}

module.exports.updateUserById = updateUserById;

async function addStudentsToCourse(courseid, userIds){
    let courseInstance = await Course.findByPk(courseid);
    if(courseInstance === null){
        return null;
    }

    let studentInstance = null;

    for(let i = 0; i < userIds.length; i ++){
        id = userIds[i];
        studentInstance = await User.findByPk(id);
        // Defined by Sequelize
        await courseInstance.addStudent(studentInstance);
    }

    return courseInstance;
}

module.exports.addStudentsToCourse = addStudentsToCourse;

async function removeStudentsFromCourse(courseid, userIds){
    let courseInstance = await Course.findByPk(courseid);
    if(courseInstance === null){
        return null;
    }

    let studentInstance = null;
    let id = 0;

    for(let i = 0; i < userIds.length; i ++){
        id = userIds[i];
        studentInstance = await User.findByPk(id);
        // Defined by Sequelize
        await courseInstance.removeStudent(studentInstance);
    }

    return courseInstance;
}
module.exports.removeStudentsFromCourse = removeStudentsFromCourse;

async function addCoursesToInstructor(instructorid, courseids){
    let userInstance = await User.findByPk(instructorid);
    if(userInstance === null){
        return null;
    }

    let courseInstance = null;
    let id = 0;
    
    for(let i = 0; i < courseids.length; i ++){
        id = courseids[i];
        courseInstance = await Course.findByPk(id);
        // Defined by Sequelize
        await courseInstance.setInstructor(userInstance);
    }

    return userInstance;
}

module.exports.addCoursesToInstructor = addCoursesToInstructor;

// DELETE
async function deleteUserById(id){
    let userInstance = await User.findByPk(id);
    await userInstance.destroy();

    return userInstance;
}

module.exports.deleteUserById = deleteUserById;