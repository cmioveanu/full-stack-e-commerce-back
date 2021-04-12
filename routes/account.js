const express = require('express');
const account = express.Router();
module.exports = account;

const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);

const passport = require('passport');
const bcrypt = require('bcrypt');




account.post('/join', async function (req, res) {
    try {
        const client = await pool.connect();
        await client.query('BEGIN');
        var pwd = await bcrypt.hash(req.body.password, 5);

        await JSON.stringify(client.query('SELECT id FROM customers WHERE email=$1', [req.body.email], function (err, result) {
            if (result.rows[0]) {
                req.flash('warning', "This email address is already registered. < a href = '/login' > Log in !</a >");
                res.redirect('/login');
            }
            else {
                client.query('INSERT INTO customers (email, phone, username, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6)', [req.body.email, req.body.phone, req.body.username, pwd, req.body.firstName, req.body.lastName], function (err, result) {
                    if (err) { console.log(err); }
                    else {

                        client.query('COMMIT')
                        console.log(result)
                        req.flash('success', 'User created.')
                        res.redirect('/');
                        return;
                    }
                });
            }

        }));
        client.release();
    }
    catch (e) { throw (e) }
});



account.post('/login', passport.authenticate('local', {
    successRedirect: '/account',
    failureRedirect: '/login',
}),
    function (req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
            req.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect('../');
    });



account.get('/logout', function (req, res) {
    req.logout();
    res.redirect('../');
    console.log("logged out!");

}); 
