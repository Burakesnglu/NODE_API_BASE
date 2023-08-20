const jwt = require("jsonwebtoken");
var ObjectId = require('mongodb').ObjectID;
const config = require('../config/config');

module.exports = (request, response, next) => {

    if(request.user.isAdmin) {
        next();
    } else{
        response.status(401).send();
    }
};