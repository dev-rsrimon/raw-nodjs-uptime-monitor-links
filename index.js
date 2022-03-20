/*
 * Title: uptime monitorin Application
 * Description: A RESTful API to monitor up or down time of user define links
 * Author: Rs. Rimon
 * Date: 17/03/2022
 *
 */

// dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

// app object - module scaffolding
const app = {};

app.init = () => {
    // start the sever
    server.init();
    // start the worker
    worker.init();
};

app.init();

// export the app
module.exports = app;
