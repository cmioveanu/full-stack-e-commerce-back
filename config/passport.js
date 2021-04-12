const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const dbConfig = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool(dbConfig);


/*
passport.use('local', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {

  loginAttempt();
  async function loginAttempt() {

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      var currentAccountsData = await JSON.stringify(client.query('SELECT id, first_name, last_name, email, password FROM customers WHERE username=$1', [username], function (err, result) {

        if (err) {
          return done(err)
        }
        if (result.rows[0] == null) {
          console.log("Oops. Incorrect login details...");
          req.flash('danger', "Oops. Incorrect login details.");
          return done(null, false);
        }
        else {
          bcrypt.compare(password, result.rows[0].password, function (err, check) {
            if (err) {
              console.log('Error while checking password');
              return done();
            }
            else if (check) {
              console.log("User authenticated successfully...");
              return done(null, [{ id: result.rows[0].id, email: result.rows[0].email, firstName: result.rows[0].firstName }]);
            }
            else {
              console.log("Incorrect login details...");
              req.flash('danger', "Oops. Incorrect login details.");
              return done(null, false);
            }
          });
        }
      }))
    }

    catch (e) { throw (e); }
  };

}
)) */




passport.use('local', new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {

  const client = await pool.connect();



  await client.query('SELECT id, first_name, last_name, email, password FROM customers WHERE username=$1', [username], function (err, user) {



    //if username not found:
    if (user.rows[0] == null) {
      console.log("Oops. Incorrect login details...");
      return done(null, false);
    }



    //if username found, check password:
    else {
      bcrypt.compare(password, user.rows[0].password, function (err, check) {
        if (check) {
          console.log("User authenticated successfully...");
          return done(null, {
            id: user.rows[0].id,
            email: user.rows[0].email,
            firstName: user.rows[0].first_name,
            lastName: user.rows[0].last_name
          });
        }
        else {
          console.log("Incorrect login details...");
          return done(null, false);
        }
      });
    }



  })

}));


passport.serializeUser(function (user, done) {
  console.log("serialize user is executing");
  done(null, user);
});


passport.deserializeUser(function (user, done) {
  console.log("de-serialize user is executing");
  done(null, user);
});

