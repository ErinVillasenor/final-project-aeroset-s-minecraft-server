/*
 * Tristan Hilbert
 * 6/6/2020
 * Courses Model
 * 
 */

const { Course, User } = require("./setup-db");
const { extractValidFields } = require("../lib/validation");

// Schema
const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorid: {required: true},
}

module.exports.CourseSchema = CourseSchema;

// READ
async function readCourses(limit, offset){
    if(limit === undefined){
        const res = await Course.findAll();
        return res;
    }else{
        const res = await Course.findAll({
            limit: limit,
            offset: offset || 0,
        });

        return res;
    }
}

module.exports.readCourses = readCourses;

async function readCourseById(id){
    const res = await Course.findByPk(id);
    return res;
}

module.exports.readCourseById = readCourseById;


// CREATE
async function createCourse(course){
    let insert = extractValidFields(course, CourseSchema);

    const res = await Course.create(insert);

    return res;
}

module.exports.createCourse = createCourse;


// Update
async function updateCourseById(id, course){
    let update = extractValidFields(course, CourseSchema);

    let courseInstance = await Course.findByPk(id);
    if(courseInstance === null){
        return null;
    }

    Object.keys(CourseSchema).forEach((field) => {
        courseInstance[field] = update[field] || courseInstance[field];
    });

    await courseInstance.save();
    return courseInstance;
}

module.exports.updateCourseById = updateCourseById;

// Not super necessary, but fun
async function updateCourseInstructorById(courseid, instructorid){
    let courseInstance = await Course.findByPk(courseid);
    if(courseInstance === null){
        return null;
    }

    let userInstance = await User.findByPk(instructorid);

    await courseInstance.setInstructor(userInstance);

    return courseInstance;
}

module.exports.updateCourseInstructorById = updateCourseInstructorById;

// DELETE
async function deleteCourseById(id){
    let courseInstance = await Course.findByPk(id);
    if(courseInstance === null){
        return null;
    }

    await courseInstance.destroy();

    return courseInstance;
}

module.exports.deleteCourseById = deleteCourseById;