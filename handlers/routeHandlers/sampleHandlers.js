/*
 * Title: sample handler
 * Description: sample handlers
 * Author: Rs. Rimon
 * Date: 17/03/2022
 *
 */
// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(200, {
        message: 'this is sample url',
    });
};

module.exports = handler;
