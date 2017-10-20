/* global process */
require('dotenv').config();

const {ADMIN_EMAIL, ADMIN_PASS} = process.env; // eslint-disable-line no-process-env

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const {CheckMaster} = require('url-master');
const checkPeriod = 10e3; // 10 seconds

const guard = {
    counter: 0,
    maxCount: 60 * 60 * 1e3 / checkPeriod,
    tryRun() {
        if (guard.counter === 0) {
            guard.counter = 1;
            return true;
        }

        guard.counter += 1;

        console.log('---> monit counter:', guard.counter);

        if (guard.counter >= guard.maxCount) {
            guard.counter = 0;
        }

        return false;
    }
};

function sendMail(errorUrls) {
    const mailOptions = {
        from: ADMIN_EMAIL,
        to: ADMIN_EMAIL, // eslint-disable-line id-length
        subject: 'Aaaaaaaaaight! TattooBrands is down!',
        html: errorUrls.statuses.map(status => '<p>' + status + '</p>').join('')
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

const checkMaster = new CheckMaster({
    period: checkPeriod, // every 10 seconds
    urls: ['http://tattoobrands.by', 'http://tattoobrands.by:3000', 'http://tattoobrands.by:3000/category/root'],
    onError: errorUrls => guard.tryRun() && sendMail(errorUrls)
});

checkMaster.run();
