const express = require('express');
const checkout = express.Router();
module.exports = checkout;
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET);


checkout.post('/', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['GB', 'US']
            },
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'T-shirt'
                        },
                        unit_amount: 2000
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000?sucess=true',
            cancel_url: 'http://localhost:3000?canceled=true'
        });

        res.json({
            id: session.id
        })
    }
    catch (err) {
        console.log(err);
    }
});