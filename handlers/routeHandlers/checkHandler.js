/*
 * Title: Check handler
 * Description: To handle check related routes
 * Author: Rs. Rimon
 * Date: 19/03/2022
 *
 */
// dependancies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token =
            typeof requestProperties.headerObject.token === 'string'
                ? requestProperties.headerObject.token
                : false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = parseJSON(tokenData).phone;

                // lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                    userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // store the check object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add checkId to user object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    // return the data about the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in server side!',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication failure!',
                                });
                            }
                        });
                    } else {
                        callback(404, {
                            error: 'User not found! please try again',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        // lookup the check
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headerObject.token === 'string'
                        ? requestProperties.headerObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            callback(200, parseJSON(checkData));
                        } else {
                            callback(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    }
                );
            } else {
                callback(500, {
                    error: 'There is a server side error!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    // validate inputs
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);

                    const token =
                        typeof requestProperties.headerObject.token === 'string'
                            ? requestProperties.headerObject.token
                            : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            // update the check object
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in server side!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'There was a problem in server side!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        // lookup the check
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headerObject.token === 'string'
                        ? requestProperties.headerObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            // delete the check data
                            data.delete('checks', id, (err1) => {
                                if (!err1) {
                                    data.read(
                                        'users',
                                        parseJSON(checkData).userPhone,
                                        (err3, userData) => {
                                            if (!err3 && userData) {
                                                const userObject = parseJSON(userData);
                                                const userChecks =
                                                    typeof userObject.checks === 'object' &&
                                                    userObject.checks instanceof Array
                                                        ? userObject.checks
                                                        : [];

                                                // remove the dleleted check id from user' list of checks
                                                const checkPosition = userChecks.indexOf(id);
                                                if (checkPosition > -1) {
                                                    userChecks.splice(checkPosition, 1);

                                                    // resave the user data
                                                    userObject.checks = userChecks;
                                                    data.update(
                                                        'users',
                                                        userObject.phone,
                                                        userObject,
                                                        (err4) => {
                                                            if (!err4) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    error: 'There is a server side error!',
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error: 'The check id that you are trying is not found in user',
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    error: 'There is a server side error!',
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        error: 'There is a server side error!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    }
                );
            } else {
                callback(500, {
                    error: 'There is a server side error!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

module.exports = handler;
