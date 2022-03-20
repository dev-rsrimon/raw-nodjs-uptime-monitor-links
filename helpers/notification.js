/*
 * Title: Notifications
 * Description: Importent function to notify user
 * Author: Rs. Rimon
 * Date: 19/03/2022
 *
 */

// dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');

// module scaffolding
const Notifications = {};

// send sms to user using twilio api
Notifications.sendTwilioSms = (phone, msg, calback) => {
    // input validations
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // strigify the payload
        const strigifyPayload = querystring.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            // callback successfully if the request  want through
            if (status === 200 || status === 201) {
                calback(false);
            } else {
                calback(`Status code returned was &=${status}`);
            }
        });

        req.on('error', (e) => {
            calback(e);
        });

        req.write(strigifyPayload);
        req.end();
    } else {
        calback('Given parameters were missing or invalid!');
    }
};

// export module
module.exports = Notifications;
