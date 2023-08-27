'use strict';

//Mongoose
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Token = mongoose.model('Token'),
    RequestResult = mongoose.model('RequestResult'),
    Test = mongoose.model('Test');

const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../models/enums");

const { response } = require('express');
const Utilities = require('../middlewares/utilites');

var ObjectId = require('mongodb').ObjectId;
var md5 = require('md5');
const jwt = require("jsonwebtoken");
const config = require('../config/config');


exports.login = function (req, res) {
    try {
        //console.log("user requested. Headers: " + JSON.stringify(req.headers));

        var parameters = req.body;

        var request = {
            password: parameters.password,
            username: parameters.username
        };

        var response = new RequestResult({
            code: -1,
            data: null,
            message: null
        });

        User.findOne({ username: { $regex: new RegExp("^" + request.username + "$", "i") } }, async function (err, user) {
            try {
                if (err) {
                    res.status(500).send(err);
                }
                if (user == null) {
                    response.code = -2; //cannot find user 
                    res.status(200).send(response);
                } else {


                    var password = Utilities.decrypt(user.password);
                    console.log("pass: " + password);

                    // var s = user.username + "@@" + password;
                    //console.log(s);
                    // var signature = md5(s);
                    //var signature = md5("test@ast.com" + "@@" + "test");

                    //console.log("signature: " + signature);
                    //console.log("request.signature: " + request.signature);


                    if (request.password == password) {
                        const payLoad = { user: user };

                        const tokenString = jwt.sign(payLoad, config.api_secret_key, { expiresIn: "12h" });

                        var token = new Token({
                            userId: user._id,
                            value: tokenString,
                            expiry: 12,
                            issueDate: new Date(),
                            lastUpdate: new Date()
                        });


                        token.save(function (err, t) {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                user.password = "";
                                response.data = {
                                    user: user,
                                    token: token
                                };
                                response.code = 1;

                                res.status(200).send(response);
                            }
                        });
                    } else {
                        response.code = -3; //wrong password
                        res.status(200).send(response);
                    }
                }
            } catch (error) {
                console.log(error)
                res.status(500).send(error.stack);
            }

        });
    } catch (error) {
        console.log(error)
        res.status(500).send(error.stack);
    }
};

exports.getUsers = async function (req, res) {
    try {
        var result = new RequestResult({
            code: -1
        });

        if (!req.user) {
            res.status(401).send(result);
            return;
        }

        var parameters = req.body;

        console.log("raw params: " + JSON.stringify(parameters))

        Utilities.clearPrimeNGFilters(parameters.filters);


        console.log("cleared params: " + JSON.stringify(parameters))

        var query = [];
        var match = {};
        var sort = {};

        var ownerId;
        /*
        if (parameters && parameters.filters) {
            for (let [key, value] of Object.entries(parameters.filters)) {
                if (key == "_id") {
                    match[key] = new ObjectId(value);
                    continue;
                }
                if (key == "active" || key == "statusxxx" || key == "serviceTypexxx" || key == "activityTypexxx") { //enums
                    match[key] = value;
                    continue;
                } 

                //other keys
                match[key] = { $regex: new RegExp(value, "i") };
            }
        }*/
        Utilities.buildMatch(parameters, match, [], ["active"])

        var limit = parameters.rows ? parameters.rows : 0;
        var skip = parameters.first ? parameters.first : 0;

        //Lookup User, Status, MasterTicket and Service Type  
        /*
        query.push({
            '$lookup': {
                "from": "ActivityType",
                "localField": "activityType",
                "foreignField": "code",
                "as": "activityTypeModel"
            }
        });
        query.push({ "$unwind": { path: "$activityTypeModel", preserveNullAndEmptyArrays: true } }); 
        */

        if (parameters.multiSortMeta) {
            query.push({ "$sort": Utilities.getPrimeNGSort(parameters.multiSortMeta) });
        } else {
            query.push({ "$sort": { "name": 1 } });
        }

        if (Object.keys(match).length > 0) {
            query.push({ "$match": match });
        }
        query.push({ "$count": "total" });

        const countResult = await User.aggregate(query);
        var total = countResult[0] ? countResult[0].total : 0;
        query.pop(); //pop count


        if (skip > 0) {
            query.push({ "$skip": skip });
        }
        if (limit > 0) {
            query.push({ "$limit": limit });
        }


        const users = await User.aggregate(query).exec();

        result.total = total;
        result.data = users;
        result.code = 1;

        res.status(200).send(result);
    } catch (error) {
        console.log(error)
        res.status(500).send(error.stack);
    }
};

exports.saveUser = async function (req, res) {
    try {


        var result = new RequestResult({
            code: -1
        });

        var newUser = Object.assign(new User(), req.body);
        var user = req.user;

        if (!newUser.name || !newUser.username) {

            result.code = -1;
            result.message = "insufficient data";
            res.status(200).send(result);

            return;
        }

        if (!newUser._id) {
            newUser._id = new ObjectId();
        }

        if (newUser.password) {
            newUser.password = Utilities.encrypt(newUser.password);
        }

        var query = { _id: newUser._id },
            update = { expire: new Date() },
            options = { upsert: true, new: true, setDefaultsOnInsert: true };

        User.findByIdAndUpdate(newUser._id, newUser, { upsert: true, new: true, setDefaultsOnInsert: true }, async function (err, savedUser) {
            if (err) {
                console.log(err);
                // res.status(500).send(err);
                res.status(Enum.HTTP_CODES.INT_SERVER_ERROR).json(Response.successResponse(req.body, Enum.HTTP_CODES.INT_SERVER_ERROR));
            } else {
                result.code = 1;
                result.data = savedUser;
                res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
                // res.status(200).send(result);
            }
        });

    } catch (error) {
        console.log(error);
        // res.status(500).send(error.stack);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
};