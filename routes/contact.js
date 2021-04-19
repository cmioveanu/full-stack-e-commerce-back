const express = require('express');
const contact = express.Router();
module.exports = contact;

require('dotenv').config();
const nodeMailer = require('nodemailer');


contact.post('/', (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        // should be replaced with real recipient's account
        from: email,
        to: process.env.EMAIL,
        subject: `New email from ${name} - ${email}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(`Email message sent to ${info.accepted[0]}`);
        res.status(200).send('Email message sent!');
    });
});
