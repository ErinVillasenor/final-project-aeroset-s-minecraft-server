/*
 * Tristan  Hilbert
 * 5/24/2020
 * Sequelize Database Setup
 * 
 */

// ---- CONFIGURATION FOR SQL DATABASE ----

const SQL_USER = process.env.SQL_USER || null;
const SQL_PASSWORD = processs.env.SQL_PASSWORD || null;
const SQL_DATABASE = processs.env.SQL_DATABASE || null;
const SQL_HOSTNAME = processs.env.SQL_HOSTNAME || null;
const SQL_PORT = process.env.SQL_PORT || 3306;

if(! (SQL_USER && SQL_PASSWORD && SQL_DATABASE && SQL_HOSTNAME)){
    console.error("UNDEFINED DATABASE ENVIRONMENT VARIABLES!")
    console.error("CONFIGURATION FAILURE!");
    process.exit(1);
}

const { Sequelize } = require("sequelize");
const db = new Sequelize(SQL_DATABASE, SQL_USER, SQL_PASSWORD, {
    dialect: "mysql",
    host: SQL_HOSTNAME,
    port: SQL_PORT,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const User = db.define('User', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    role: {
        type: Sequelize.ENUM("student", "instructor", "admin"),
        defaultValue: "student"
    }
});

const Course = db.define('Course', {
    subject: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    number: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    term: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});


const Submission = db.define('Submission', {
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    file: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

const Assignment = db.define('Assignment', {
    points: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    due: {
        type: Sequelize.DATE,
        allowNull: false
    }
});


// Relationships

// Course To Student Definition
User.belongsToMany('Course', 
{
    as: "courses",
    through: "CourseToStudent",    
});

Course.belongsToMany('User', 
{ 
    as: "students",
    through: "CourseToStudent",
});


// Instructor Ownership
Course.belongsTo('User',
{
    as: "instructor",
    foreignKey: "instructorid",
});

User.hasMany('Course', {
    foreignKey: "instructorid",
});

// User has many Submissions

Submission.belongsTo('User', {
    foreignKey: "studentid",
});

User.hasMany('Submission', {
    foreginKey: "studentid",
});

// Assignment has many submissions

Assignment.hasMany("Submission", {
    foreginKey: "assignmentid",
    onDelete: "CASCADE",
});

Submission.belongsTo("Assignment", {
    foreginKey: "assignmentid",
    onDelete: "CASCADE"
});


// Courses Have Many Assignment

Course.hasMany("Assignment", {
    foreginKey: "courseid",
    onDelete: "CASCADE"
});

Assignment.belongsTo("Course", {
    foreignKey: "courseid"
});

// Sync it all!
async function initDB(){
    await db.sync({alter: true});
}

function initDBCallback(cb){
    db.sync({alter: true}).then(() => {
        cb()
    },
    (err) => {
        throw err;
    });
}


// Export Models
module.exports = {
    User,
    Course,
    Submission,
    Assignment,
    initDB,
    initDBCallback,
}


