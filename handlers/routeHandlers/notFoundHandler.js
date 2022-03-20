/*
 * Title: Not found handler
 * Description: Not found handler
 * Author: Rs. Rimon
 * Date: 17/03/2022
 *
 */
// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your requested URL was not found!',
    });
};

module.exports = handler;
