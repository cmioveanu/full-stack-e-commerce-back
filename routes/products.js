const express = require('express');
const products = express.Router();
module.exports = products;

const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);


//get all products
products.get('/', (req, res) => {
    pool.query('SELECT * FROM Products', (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    })
});