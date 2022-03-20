/*
 * Title: Environments
 * Description: Environments
 * Author: Rs. Rimon
 * Date: 17/03/2022
 *
 */

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'kjfkdsjfdfkdsjkfjdskjdsfka',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15593795549',
        accountSid: 'ACc67da9476b985c53b525711b020ca345',
        authToken: '544231d41fb30bcb3bdd45fe62aad52a',
    },
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'euiruewiruiewurieukdsfjkd',
    maxChecks: 5,
    twilio: {
        fromPhone: '+1 559 379 5549',
        accountSid: 'ACc67da9476b985c53b525711b020ca345',
        authToken: '544231d41fb30bcb3bdd45fe62aad52a',
    },
};

// determine which environment was passed
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// export module
module.exports = environmentToExport;
