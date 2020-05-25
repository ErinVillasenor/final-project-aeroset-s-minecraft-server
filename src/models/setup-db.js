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

// INIT CODE HERE!