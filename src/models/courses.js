/*
 * Tristan Hilbert
 * 6/6/2020
 * Courses Model
 * 
 */

const { Course } = require("./setup-db");
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
    let insert = extractValidFields(CourseSchema);

    const res = await Course.create(insert);

    return res;
}

module.exports.createCourse = createCourse;


// Update
async function updateCourseById(id, course){
    let update = extractValidfields(course, CourseSchema);

    let courseInstance = await Course.findByPk(id);

    Object.keys(CourseSchema).forEach((field) => {
        courseIntance[field] = update[field];
    });

    await courseInstance.save();
    return courseInstance;
}

module.exports.updateCoursebyId = updateCourseById;

// DELETE
async function deleteCourseById(id){
    let courseInstance = await Course.findByPk(id);

    await scourseInstance.destroy();

    return courseInstance;
}

module.exports.deleteCoursebyId = deleteCourseById;