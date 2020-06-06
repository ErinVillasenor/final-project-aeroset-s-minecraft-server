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

async function readUsersByCourseId(courseid){
    const res = await Course.findByPk(courseid, {
        include: {
            model: User,
            as: "students"
        }
    });

    return res;
}

module.exports.readUsersByCourseId = readUsersByCourseId;

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
    let update = extractValidfields(user, UserSchema);

    let userInstance = await User.findByPk(id);

    Object.keys(UserSchema).forEach((field) => {
        userIntance[field] = update[field];
    });

    await userInstance.save();
    return userInstance;
}

module.exports.updateUserById = updateUserById;


// DELETE
async function deleteUserById(id){
    let userInstance = await User.findByPk(id);
    await userInstance.destroy();

    return userInstance;
}

module.exports.deleteUserById = deleteUserById;