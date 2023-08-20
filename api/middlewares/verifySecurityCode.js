const jwt = require("jsonwebtoken");
var ObjectId = require('mongodb').ObjectID;
const config = require('../config/config');

module.exports = (request, response, next) => {

    const securityCode = request.headers["security-code"];
 
    if (!securityCode) {
        response.status(401).send("No securityCode found");
    } else {
        if (securityCode == config.security_code) {
            //verified
            next();
        } else {
            response.status(401).send("security code mismatch");
        }
    }
};