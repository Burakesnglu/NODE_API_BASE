'use strict';

//Mongoose
var mongoose = require('mongoose'),
    City = mongoose.model('City'), 
    Country = mongoose.model('Country'), 
    Parameter = mongoose.model('Parameter'), 
    RequestResult = mongoose.model('RequestResult'), 
    Test = mongoose.model('Test'),
    Town = mongoose.model('Town');


const { response } = require('express');
const Utilities = require('../middlewares/utilites');

var ObjectId = require('mongodb').ObjectId;


exports.getTest = function (req, res) {
    try {
        var result = new RequestResult({
            code: -1
        });

        Test.find({}, function (err, testRecords) {
            if (err) {
                res.status(500).send(err);
            }

            if (testRecords == null) {
                result.code = 0;
                result.total = 0;
                res.status(200).send();
            } else {
                result.total = testRecords.length;
                result.data = testRecords;
                result.code = 1;
                res.status(200).send(result);
            }
        });
    } catch (error) {
        res.status(500).send(error.stack);
    }
};

exports.getCities = async function (req, res) {
    try {
        var result = new RequestResult({
            code: -1
        });

        if (!req.user) {
            res.status(401).send(result);
            return;
        }

        var parameters = req.body;

        Utilities.clearPrimeNGFilters(parameters.filters);

        var query = [];
        var match = {};
        var sort = {};

        Utilities.buildMatch(parameters, match, ["countryId"], []);

        var limit = parameters.rows ? parameters.rows : 0;
        var skip = parameters.first ? parameters.first : 0;

        if (parameters.multiSortMeta) {
            query.push({ "$sort": Utilities.getPrimeNGSort(parameters.multiSortMeta) });
        } else {
            query.push({ "$sort": { "name": 1 } });
        }

        if (Object.keys(match).length > 0) {
            query.push({ "$match": match });
        }
        query.push({ "$count": "total" });

        const countResult = await ContactCode.aggregate(query);
        var total = countResult[0] ? countResult[0].total : 0;
        query.pop(); //pop count


        if (skip > 0) {
            query.push({ "$skip": skip });
        }
        if (limit > 0) {
            query.push({ "$limit": limit });
        }

        const cities = await City.aggregate(query).exec();

        result.total = total;
        result.data = cities;
        result.code = 1;

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.stack);
    }
};

exports.getCountries = async function (req, res) {
    try {
        var result = new RequestResult({
            code: -1
        });

        if (!req.user) {
            res.status(401).send(result);
            return;
        }

        var parameters = req.body;

        Utilities.clearPrimeNGFilters(parameters.filters);

        var query = [];
        var match = {};
        var sort = {};

        Utilities.buildMatch(parameters, match, [], []);

        var limit = parameters.rows ? parameters.rows : 0;
        var skip = parameters.first ? parameters.first : 0;

        if (parameters.multiSortMeta) {
            query.push({ "$sort": Utilities.getPrimeNGSort(parameters.multiSortMeta) });
        } else {
            query.push({ "$sort": { "name": 1 } });
        }

        if (Object.keys(match).length > 0) {
            query.push({ "$match": match });
        }
        query.push({ "$count": "total" });

        const countResult = await ContactCode.aggregate(query);
        var total = countResult[0] ? countResult[0].total : 0;
        query.pop(); //pop count


        if (skip > 0) {
            query.push({ "$skip": skip });
        }
        if (limit > 0) {
            query.push({ "$limit": limit });
        }


        const countries = await Country.aggregate(query).exec();

        result.total = total;
        result.data = countries;
        result.code = 1;

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.stack);
    }
};

exports.getParameters = async function (req, res) {
    try {
        var result = new RequestResult({
            code: -1
        });

        if (!req.user) {
            res.status(401).send(result);
            return;
        }

        var parameters = req.body;

        Utilities.clearPrimeNGFilters(parameters.filters);

        var query = [];
        var match = {};
        var sort = {};

        Utilities.buildMatch(parameters, match, [], [type]);

        var limit = parameters.rows ? parameters.rows : 0;
        var skip = parameters.first ? parameters.first : 0;

        if (parameters.multiSortMeta) {
            query.push({ "$sort": Utilities.getPrimeNGSort(parameters.multiSortMeta) });
        } else {
            query.push({ "$sort": { "name": 1 } });
        }

        if (Object.keys(match).length > 0) {
            query.push({ "$match": match });
        }
        query.push({ "$count": "total" });

        const countResult = await Parameter.aggregate(query);
        var total = countResult[0] ? countResult[0].total : 0;
        query.pop(); //pop count


        if (skip > 0) {
            query.push({ "$skip": skip });
        }
        if (limit > 0) {
            query.push({ "$limit": limit });
        }

        const parametersResult = await Parameter.aggregate(query).exec();

        result.total = total;
        result.data = parametersResult;
        result.code = 1;

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.stack);
    }
};

exports.getTowns = async function (req, res) {
    try {
        var result = new RequestResult({
            code: -1
        });

        if (!req.user) {
            res.status(401).send(result);
            return;
        }

        var parameters = req.body;

        Utilities.clearPrimeNGFilters(parameters.filters);

        var query = [];
        var match = {};
        var sort = {};


        Utilities.buildMatch(parameters, match, ["countryId", "cityId"], []);

        var limit = parameters.rows ? parameters.rows : 0;
        var skip = parameters.first ? parameters.first : 0;

        if (parameters.multiSortMeta) {
            query.push({ "$sort": Utilities.getPrimeNGSort(parameters.multiSortMeta) });
        } else {
            query.push({ "$sort": { "name": 1 } });
        }

        if (Object.keys(match).length > 0) {
            query.push({ "$match": match });
        }
        query.push({ "$count": "total" });

        const countResult = await ContactCode.aggregate(query);
        var total = countResult[0] ? countResult[0].total : 0;
        query.pop(); //pop count


        if (skip > 0) {
            query.push({ "$skip": skip });
        }
        if (limit > 0) {
            query.push({ "$limit": limit });
        }


        const towns = await Town.aggregate(query).exec();

        result.total = total;
        result.data = towns;
        result.code = 1;

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.stack);
    }
};

