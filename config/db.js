const path = require('path');
require('dotenv').config({path: '../.env'});

/*
const dbConfig = {
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    host:     process.env.DB_HOST,
    database: process.env.DB,
    port:     process.env.DB_PORT
};
*/

const connectionString = process.env.DATABASE_URL;
module.exports = connectionString;