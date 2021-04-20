const express = require('express');
const orders = express.Router();
module.exports = orders;

const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);


const checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else {
        res.redirect("/login");
    }
}


//get list of previous orders
orders.get('/', checkAuthentication, async (req, res) => {
    const ordersList = [];
    const ids = await pool.query(`SELECT id FROM orders WHERE orders.customer_id = $1 ORDER BY id DESC`, [req.user.id]);

    const idNumbers = ids.rows.map(id => id.id);

    for (let i = 0; i < idNumbers.length; i++) {
        const result = await pool.query(`
            SELECT orders_products.order_id,
                   orders_products.product_id,
                   orders_products.quantity,
                   orders.created_at,
                   orders.status,
                   products.name,
                   products.unit_price
            FROM orders_products
            JOIN orders ON orders_products.order_id = orders.id
            JOIN products ON orders_products.product_id = products.id
            WHERE orders_products.order_id = ${idNumbers[i]}`);

        const total = await pool.query(`
        SELECT DISTINCT order_id, SUM(quantity * unit_price)
        FROM orders_products
        JOIN products 
        ON orders_products.product_id = products.id
        GROUP BY 1
        HAVING orders_products.order_id = ${idNumbers[i]}
        ORDER BY 1 DESC`);

        if (result.rows.length > 0) {
            result.rows[0].totalOrderAmount = total.rows[0].sum;
            result.rows[0].firstName = req.user.firstName;
            result.rows[0].lastName = req.user.lastName;
            ordersList.push(result.rows);
        }
    }
    res.send(ordersList);
});


//record a new order in the database
orders.post('/', (req, res) => {
    const customerId = req.body.customerId;
    const products = req.body.orderProducts;

    const now = new Date();
    const queryString = `
        INSERT INTO Orders(customer_id, created_at, status)
        VALUES($1, $2, $3)
        RETURNING *
        `;

    pool.query(queryString, [customerId, now, "Pending"], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            try {
                products.forEach(product => {
                    productString = `
                    INSERT INTO Orders_Products
                    VALUES($1, $2, $3, $4)
                    `;

                    pool.query(productString, [result.rows[0].id, product.id, product.quantity * product.price, product.quantity]);
                });
            } catch (error) {
                console.log(error);
            }

            res.status(201).send("Order created!");
        }
    });

});


//cancel a previous order
orders.put('/:id', (req, res) => {
    const orderId = req.params.id;
    const queryString = `
        UPDATE Orders
        SET status = 'Canceled'
        WHERE id = $1
        `;
    pool.query(queryString, [orderId]);
    res.status(200).send("Updated successfuly!");
});


//update status to paid for last order
orders.get('/paid', (req, res) => {
    pool.query(`SELECT id FROM orders ORDER BY id DESC LIMIT 1`, (error, result) => {
        if (error) {
            console.error('Can\'t select from orders by id', error);
        }

        const orderId = result.rows[0].id;

        pool.query("UPDATE orders SET status = 'Paid' WHERE id = $1", [orderId], (err, results) => {
            if (err) {
                console.error('Error updating order to Paid', err);
            }

            res.status(200).send('Status updated to paid for last order.');
        })
    })
})


//cancel order
orders.delete('/delete', (req, res) => {
    pool.query(`SELECT id FROM orders ORDER BY id DESC LIMIT 1`, (error, result) => {
        if (error) {
            console.error(error);
        }

        //set the order id
        const orderId = result.rows[0].id;

        //delete the orders_products then the order
        pool.query(`
        DELETE FROM orders_products WHERE order_id = $1
        `, [orderId], (error, result) => {
            if (error) {
                console.error('Could not delete from orders_products', error);
            }

            //delete the order
            pool.query(`DELETE from orders WHERE id = $1`, [orderId], (error, result) => {
                if (error) {
                    console.error('Could not delete from orders.', error);
                }

                res.status(200).send('Order deleted.');
            })
        })
    });
});