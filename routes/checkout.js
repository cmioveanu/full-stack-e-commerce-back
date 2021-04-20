const express = require('express');
const checkout = express.Router();
module.exports = checkout;
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET);


checkout.post('/', async (req, res) => {
    const products = req.body;

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