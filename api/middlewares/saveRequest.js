//Mongoose
var mongoose = require('mongoose'),
    Request = mongoose.model('Request'),
    Response = mongoose.model('Response');

const jwt = require("jsonwebtoken");
var ObjectId = require('mongodb').ObjectID;
const config = require('../config/config');

module.exports = (request, response, next) => {
 
    var reqId = new ObjectId();
    request._id = reqId;
    var r = new Request({
        _id: reqId,
        headers: request.headers,
        body: request.body,
        url: request.url,
        xForwardedFor: request.headers['x-forwarded-for'],
        remoteAddress: request.connection.remoteAddress
    });

    r.save(function (err, t) {
        if (err) {
            var resp = {
                code: -1,
                message: "Internal Server Error occured while saving request. Contact API team with Error Code 800"
            }

            response.status(500).send(resp);
        } else {
            next();
        }
    });

    var oldWrite = response.write,
        oldEnd = response.end;

    var chunks = [];

    response.write = function (chunk) { 
        chunks.push(chunk);

        return oldWrite.apply(response, arguments);
    };

    response.end = function (chunk) {
        var tArguments = arguments;
        try {
            if (response.statusCode == 500) {
                if (chunk) {
                    chunks.push(chunk);
                }

                var body = Buffer.concat(chunks).toString('utf8'); 
 
                var r = new Response({
                    requestId: request._id,
                    status : response.statusCode,
                    url: request.url,
                    body: body
                });

                r.save(function (err, t) {
                    if (err) {
                        tArguments[0] = Buffer.from(JSON.stringify({
                            code: -1,
                            message: "Internal Server Error occured while saving error response. Contact API team with Error Code 900"
                        }), 'utf8');
                        //oldEnd.apply(response, tArguments);
                        oldEnd.apply(response, arguments);
                    } else {
                        tArguments["0"] = Buffer.from(JSON.stringify({
                            code: -1,
                            message: "Internal Server Error occured. Contact API team with request ID: " + request._id
                        }), 'utf8');
                        //oldEnd.apply(response, tArguments);
                        oldEnd.apply(response, arguments);
                    }

                });

            } else {
                oldEnd.apply(response, arguments);
            }
        } catch (error) { 
            oldEnd.apply(response, arguments);
        }

    };


};