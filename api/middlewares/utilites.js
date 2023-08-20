'use strict';
const Cryptr = require('cryptr');
const cryptr = new Cryptr('@tadruXl-eyLPi3*3uP-');
const baseCredit = 10;

//Mongoose
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var nodemailer = require('nodemailer');
var crypto = require('crypto');


var { ParameterType } = require('../models/enums');


var ObjectId = require('mongodb').ObjectId;

var transporter = nodemailer.createTransport({
    host: "",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: "",
        pass: ""
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});


const sendMail = function (mailOptions, callback) {
    transporter.sendMail(mailOptions, function (error, info) {
        callback(error, info);
    });
}




/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
const sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

function encrypt(text) {
    return cryptr.encrypt(text);
}

function decrypt(text) {
    return cryptr.decrypt(text);
}

const genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
};

const getServiceTypes = async function () {
    var serviceTypes = await ServiceType.find();

    var dataMap = {};
    serviceTypes.forEach(serviceType => {
        dataMap[serviceType.code] = serviceType;
    });

    return dataMap;

}

function clearPrimeNGFilters(filters) {
    try {
        if (filters) {
            for (let [key, value] of Object.entries(filters)) {
                if (filters[key].value == null || filters[key].value.length == 0) {
                    delete filters[key];
                } else {
                    filters[key] = value.value;
                }
            }
        }
    } catch (err) {
    }
}


function getPrimeNGSort(sortArray) {
    try {
        let result = {};
        sortArray.forEach(sort => {
            result[sort.field] = sort.order
        });
        return result;
    } catch (err) {
    }
}

const getNewPackageNoAsync = async function () {
    var parameter = await Parameter.findOne({ type: ParameterType.TICKET_NO });
    var date = new Date();

    if (date.getMonth() < 9) {
        var mm = "0" + (date.getMonth() + 1);
    } else var mm = date.getMonth() + 1;

    var yy = date.getFullYear().toString().substr(2, 2);

    var yymm = "" + yy + mm;
    var result = yymm + parameter.value;

    parameter.value += 1;
    await Parameter.updateOne({ _id: parameter._id }, { $inc: { 'value': 1 } });

    return result;

}

const buildMatch = async function (parameters, match, idArray, exactArray) {
    for (let [key, value] of Object.entries(parameters.filters)) {
        if (key == "_id") {
            match[key] = new ObjectId(value);
            continue;
        }
        if (idArray.includes(key)) {
            match[key] = new ObjectId(value);
            continue;
        }
        if (exactArray.includes(key)) { //enums
            match[key] = value;
            continue;
        } 

        //other keys
        match[key] = { $regex: new RegExp(value, "i") };
    }
}

exports.sendMail = sendMail;
exports.genRandomString = genRandomString;
exports.sha512 = sha512;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.getServiceTypes = getServiceTypes;
exports.clearPrimeNGFilters = clearPrimeNGFilters;
exports.getPrimeNGSort = getPrimeNGSort;
exports.getNewPackageNoAsync = getNewPackageNoAsync;
exports.buildMatch = buildMatch;