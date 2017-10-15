/* global process */
require('dotenv').config();

const {ADMIN_EMAIL, ADMIN_PASS} = process.env; // eslint-disable-line no-process-env

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const {CheckMaster} = require('url-master');

const checkMaster = new CheckMaster({
    period: 5000, // every 5s
    urls: ['http://tattoobrands.by1', 'http://tattoobrands.by:30001', 'http://tattoobrands.by:3000/category/root'],
    onError: urlErr => {
        const mailOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL, // eslint-disable-line id-length
            subject: 'Aaaaaaaaaight! TattooBrands is down!',
            html: urlErr.statuses.map(status => '<p>' + status + '</p>').join('')
        };

        const transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            auth: {
                user: ADMIN_EMAIL,
                pass: ADMIN_PASS
            }
        }));

        transporter.sendMail(mailOptions, mailErr => mailErr ?
            console.error(mailErr) :
            console.log('Email sent to:', ADMIN_EMAIL));
    }
});

checkMaster.run();


