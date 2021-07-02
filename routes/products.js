const express = require('express');
const products = express.Router();
module.exports = products;

const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool({
    connectionStirng: dbConfig,
    ssl: { rejectUnauthorized: false }
});


//get all products
products.get('/', (req, res) => {
    pool.query('SELECT * FROM products', (error, results) => {
        if (error) {
            console.error('Unable to select products', error);
        }
        res.status(200).json(results.rows);
    })
});


//get sunglasses details
products.get('/sunglasses/:productId', (req, res) => {
    const productId = req.params.productId;

    pool.query(`
    SELECT * FROM sunglasses
    WHERE product_id = $1
    `, [productId], (error, results) => {
        if(error) {
            console.error('Unable to select sunglasses', error);
        }
        res.status(200).send(results.rows[0]);
    });
});


//get watches details
products.get('/watches/:productId', (req, res) => {
    const productId = req.params.productId;

    pool.query(`
    SELECT * FROM watches
    WHERE product_id = $1
    `, [productId], (error, results) => {
        if(error) {
            console.error('Unable to select watches', error);
        }

        res.status(200).send(results.rows[0]);
    });
});