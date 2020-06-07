/*
 * Tristan  Hilbert
 * 5/24/2020
 * Sequelize Database Setup
 * 
 */

// ---- CONFIGURATION FOR SQL DATABASE ----

const SQL_USER = process.env.DB_USER || null;
const SQL_PASSWORD = process.env.DB_PASSWORD || null;
const SQL_DATABASE = process.env.DB_DATABASE || null;
const SQL_HOSTNAME = process.env.DB_HOSTNAME || null;
const SQL_PORT = process.env.DB_PORT || 3306;

if(! (SQL_USER && SQL_PASSWORD && SQL_DATABASE && SQL_HOSTNAME)){
    console.error("UNDEFINED DATABASE ENVIRONMENT VARIABLES!")
    console.error("CONFIGURATION FAILURE!");
    process.exit(1);
}

const { Sequelize, DataTypes } = require("sequelize");

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
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("student", "instructor", "admin"),
        defaultValue: "student"
    }
});

const Course = db.define('Course', {
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    term: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});


const Submission = db.define('Submission', {
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

const Assignment = db.define('Assignment', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    due: {
        type: DataTypes.DATE,
        allowNull: false,
    }
});

// Course To Student Definition
User.belongsToMany(Course, {
    through: "CourseToStudent",
});

Course.belongsToMany(User, { 
    as: "student",
    through: "CourseToStudent",
});


// Instructor Ownership

User.hasMany(Course, {
    as: "instructor",
    foreignKey: "instructorid",
    onDelete: "CASCADE",
    constraints: true,
});
Course.belongsTo(User, {
    as: "instructor",
    foreignKey: "instructorid",
});

// User has many Submissions

User.hasMany(Submission, {
    foreignKey: "studentid",
    onDelete: "CASCADE",
    constraints: true,
});
Submission.belongsTo(User, {
    foreignKey: "studentid",
});

// Assignment has many submissions

Assignment.hasMany(Submission, {
    foreignKey: "assignmentid",
    onDelete: "CASCADE",
    constraints: true,
});
Submission.belongsTo(Assignment, {
    foreignKey: "assignmentid",
});


// Courses Have Many Assignment

Course.hasMany(Assignment, {
    foreignKey: "courseid",
    onDelete: "CASCADE",
    constraints: true,
});
Assignment.belongsTo(Course, {
    as: "course",
    foreignKey: "courseid",
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
    db,
}


