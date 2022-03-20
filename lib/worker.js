/*
 * Title: worker library
 * Description: worker realted file
 * Author: Rs. Rimon
 * Date: 20/03/2022
 *
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notification');

// server object - module scaffolding
const worker = {};

// lookup all the checks from database
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                // read the checksData
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validate
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the check data');
                    }
                });
            });
        } else {
            console.log('Error could not find any checks process!');
        }
    });
};

// validate individual check data
worker.validateCheckData = (originalCheckData) => {
    const originalData = originalCheckData;
    if (originalData && originalData.id) {
        originalData.state =
            typeof originalData.state === 'string' &&
            ['up', 'down'].indexOf(originalData.state) > -1
                ? originalData.state
                : 'down';
        originalData.lastChecked =
            typeof originalData.lastChecked === 'number' && originalData.lastChecked > 0
                ? originalData.lastChecked
                : false;

        // pass to the next process
        worker.performCheck(originalData);
    } else {
        console.log('Error: check was invalid or not properly formated!');
    }
};

// perform check
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let chekcOutcome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome  has not been sent yet
    let outcomeSent = false;

    // parse url hostname & full url from original data
    const parseUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parseUrl.hostname;
    const { path } = parseUrl;

    // consttuct the request
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;
    const req = protocolToUse.request(requestDetails, (res) => {
        // get the status of response
        const status = res.statusCode;

        // updata the chek outcome and pass to the next process
        chekcOutcome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, chekcOutcome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        chekcOutcome = {
            error: true,
            value: e,
        };
        // updata the chek outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, chekcOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        chekcOutcome = {
            error: true,
            value: 'timeout',
        };
        // updata the chek outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, chekcOutcome);
            outcomeSent = true;
        }
    });
    req.end();
};

// save check outcome to database and sent to next process
worker.processCheckOutcome = (originalCheckData, chekcOutcome) => {
    // check if check outcome is up or down
    const state =
        !chekcOutcome.error &&
        chekcOutcome.responseCode &&
        originalCheckData.successCodes.indexOf(chekcOutcome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert the user or not
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // send the checkdata to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed there is no state change!');
            }
        } else {
            console.log('Error: trying ot save check data of one of the check!');
        }
    });
};

// send notification  sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via sms: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user');
        }
    });
};

// timer to execute the worker process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

// start the server
worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    // call the loop so that checks contrinue
    worker.loop();
};

// exprots
module.exports = worker;
