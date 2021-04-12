require('dotenv').config();
const express = require('express');
const app = express();


/****  Dependencies  ****/
/***********************/
const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));






const session = require('express-session');
app.use(session({secret: 'mySecretKey'}));

app.use(require('cookie-parser')());

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');


app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Credentials', "true");
    next();
});































//****  Routes  ****/
//*****************/

const accountRouter = require('./routes/account');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

app.use('/account', accountRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);












const port = process.env.PORT;

app.listen(port, () => console.log(`Listening on port ${port}...`));