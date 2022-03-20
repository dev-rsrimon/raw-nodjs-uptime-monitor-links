/*
 * Title: Utilities
 * Description: Important utilities
 * Author: Rs. Rimon
 * Date: 18/03/2022
 *
 */

// dependancies
const crypto = require('crypto');
const environment = require('./environments');

// module scaffolding
const utilities = {};

// parse json
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch (error) {
        output = {};
    }

    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environment.secretKey).update(str).digest('hex');

        return hash;
    }
    return false;
};

// create random string
utilities.createRandomString = (strLength) => {
    let length = strLength;
    length = typeof strLength === 'number' && strLength > 0 ? strLength : false;

    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwzyz1234567890';
        let output = '';
        for (let i = 1; i <= length; i += 1) {
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            output += randomCharacter;
        }
        return output;
    }
    return false;
};

// export module
module.exports = utilities;
