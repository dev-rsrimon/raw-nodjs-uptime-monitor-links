/*
 * Title: Application Routes
 * Description: Application routes
 * Author: Rs. Rimon
 * Date: 17/03/2022
 *
 */

// dependancies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandlers');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
