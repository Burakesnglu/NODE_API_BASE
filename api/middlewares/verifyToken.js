const jwt = require("jsonwebtoken");
var ObjectId = require('mongodb').ObjectID;
const config = require('../config/config');

module.exports = (request, response, next) => {
    const token = request.headers["x-access-token"] || request.body.token || request.query.token;
    
    if (!token)
        response.status(401).send("No token found");
    else {
        jwt.verify(token, config.api_secret_key, (error, decoded) => {
            if (error) {
                if (error.name === "TokenExpiredError") {
                    response.status(401).send(error);
                } else {
                    response.status(501).send(error);
                }
            }
            else {
                request.decode = decoded;
                
                //console.log("request.decode: " + JSON.stringify(request.decode));
                request.user =  request.decode.user;
                 
                next();
            }
        });
    }
};