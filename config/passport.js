const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);
const bcrypt = require('bcrypt');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy((username, password, done) => {
    pool.query(`
        SELECT * FROM customers
        WHERE email = $1
        `, [username], (err, result) => {
        if (err) {
            return done(err);
        }

        //if username doesn't exist in DB, return false
        if (!result.rows[0]) {
            return done(null, false);
        }

        //if passwords match, return the user; otherwise, return false
        bcrypt.compare(password, result.rows[0].password, (err, check) => {
            if (check) {
                return done(null, result.rows[0]);
            } else {
                return done(null, false);
            }
        })
    });
}
));


//serialize user id in cookie and get the user from DB on further requests, based on id
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    pool.query(`
    SELECT id, email, first_name, last_name, phone FROM customers
    WHERE id = $1`, [id], (err, result) => {
        done(err, result.rows[0]);
    })
});