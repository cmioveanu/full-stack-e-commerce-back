const express = require('express');
const checkout = express.Router();
module.exports = checkout;
require('dotenv').config();

const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);

const stripe = require('stripe')(process.env.STRIPE_SECRET);


checkout.post('/', async (req, res) => {
    const { products, productIds } = req.body;

    //insert the new order into database
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error aquiring client', err.stack);
        }

        //create the new order
        client.query(`
        INSERT INTO orders(customer_id, created_at, status)
        VALUES($1, current_timestamp, $2)
        `, [req.user.id, 'Pending'], (error, result) => {
            if (error) {
                console.error(error);
            }
        });

        //get the order id and insert all the products from the order in the database
        client.query(`
        SELECT id FROM orders ORDER BY id DESC LIMIT 1
        `, (error, result) => {
            if (error) {
                console.error('Couldn\'t get id', error);
            }

            //set the order id
            const orderId = result.rows[0].id;

            //insert products
            productIds.forEach(product => {
                client.query(`
                INSERT INTO orders_products
                VALUES($1, $2, $3)
                `, [orderId, product.id, product.quantity], (error, result) => {
                    if (error) {
                        console.error(error);
                    }
                });
            });
        })
    });


    //Stripe checkout
    try {
        //create a Stripe session
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['GB', 'US']
            },
            payment_method_types: ['card'],
            line_items: products,
            mode: 'payment',
            success_url: 'http://localhost:3000/account?success=true',
            cancel_url: 'http://localhost:3000/account?canceled=true'
        });

        //send back the session id
        res.json({
            id: session.id
        })
    }
    catch (err) {
        console.log(err);
    }
});