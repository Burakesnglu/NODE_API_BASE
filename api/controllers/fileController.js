
'use strict';

//Mongoose
var mongoose = require('mongoose'),
    RequestResult = mongoose.model('RequestResult'),
    FileInfo = mongoose.model('FileInfo'),
    FileInfoMetaData = mongoose.model('FileInfoMetaData');

const Utilities = require('../middlewares/utilites');
const bucketName = 'fs'
var ObjectId = require('mongodb').ObjectId;

const fileUpload = require('express-fileupload');


var fs = require('fs');
var path = require('path');
var async = require('async');


exports.uploadFile = function (req, res) {
    try { 
        var gridfsbucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            chunkSizeBytes: 1024,
            bucketName: bucketName
        });
        var result = new RequestResult({
            code: -1
        });

        var user = req.user;

        var filesArray = req.files; 

        var parameters = JSON.parse(req.headers.parameters);

         
        var metadata =  parameters.metadata ;  

        if (!metadata.ownerId) {
            result.data = "Owner Id not sent"
            res.status(200).send(result);

            return;
        }

        metadata.ownerId = new ObjectId(metadata.ownerId);
        if(metadata.userId) {
            metadata.userId = new ObjectId(metadata.userId);
        }
        metadata.uploadedBy = user._id;
        async.each(filesArray, function (file, eachcallback) {
            async.waterfall([
                function (callback) {
                    fs.readFile(file.path, (err, data) => {
                        if (err) { 
                        }
                        else {
                            callback(null, data);
                        }
                    });
                },
                function (data, callback) {
                    fs.createReadStream(file.path)
                        .pipe(gridfsbucket.openUploadStream(file.path, { metadata: metadata }))
                        .on('error', () => { 
                            result.data = error
                            res.status(200).send(result);
                        })
                        .on('finish', () => {
                            //process.exit(0); 
                            result.status = 1;
                            res.status(200).send(result);
                        });
                }
            ], function (err, result) {
                eachcallback();
            });
        }, function (err) { 
            if (err) { 
                res.status(500).send(err.stack);
            }
            else { 
            }
        });

    } catch (error) { 
        res.status(500).send(error.stack);
    }

}

exports.listFiles = async function (req, res) {
    try {
        var parameters = JSON.parse(req.headers.parameters);
        var query = [];
        var match = {};
        var match2 = {};
        var sort = {};

        var limit = 99999;
        var skip = 0;

        var state = parameters.state;
        if (state) {
            if (state.filter) {
                var filter;
                for (filter of state.filter.filters) {
                    match2[filter.field] = { $regex: new RegExp(filter.value, "i") };
                }
            }

            if (state.sort) {
                var order;
                for (order of state.sort) {
                    sort[sort.field] = sort.dir == 'asc' ? 1 : -1;
                }
            }

            limit = state.take;
            skip = state.skip;
        }

        if (parameters.fileType != "") {
            match["metadata.type"] = parameters.fileType;
        }

        var startDate = new Date(2000, 1, 1);
        var endDate = new Date();
        if (parameters.startDate && parameters.startDate != "") {
            startDate = new Date(parameters.startDate); //new Date(parameters.startDate.year, parameters.startDate.month - 1, parameters.startDate.day);
        }

        if (parameters.endDate && parameters.endDate != "") {
            endDate = new Date(parameters.endDate); //new Date(parameters.endDate.year, parameters.endDate.month - 1, parameters.endDate.day);
        }

        query.push({ "$sort": { _id: -1 } });
        query.push({
            "$match": {
                "metadata.userId": /*new ObjectId("602504c0ceb403692729f5c8") */req.userId,
                "$and": [{ uploadDate: { "$gte": startDate } }, { uploadDate: { "$lte": endDate } }]
            }
        });
        query.push({ "$match": match });

        query.push({
            '$lookup': {
                "from": "Package",
                "localField": "metadata.ownerId",
                "foreignField": "_id",
                "as": "package"
            }
        });
        query.push({ "$unwind": { path: "$package", preserveNullAndEmptyArrays: true } });

        if (parameters.status != "") {
            var status = Number(parameters.status);
            if (!isNaN(status)) {
                query.push({ "$match": { "package.status": status } });
            }
        }


        if (parameters.packageNo != "") {
            query.push({ "$match": { "package.packageNo": { $regex: new RegExp(parameters.packageNo, "i") } } });
        }

        if (parameters.orderNo != "") {
            query.push({ "$match": { "package.orderNo": { $regex: new RegExp(parameters.orderNo, "i") } } });
        }

        if (parameters.mpOrderNo != "") {
            query.push({ "$match": { "package.mpOrderNo": { $regex: new RegExp(parameters.mpOrderNo, "i") } } });
        }


        query.push({
            '$lookup': {
                "from": "User",
                "localField": "metadata.uploadedBy",
                "foreignField": "_id",
                "as": "uploadedBy"
            }
        });
        query.push({ "$unwind": { path: "$uploadedBy", preserveNullAndEmptyArrays: true } });
        if (parameters.isAdmin) {
            query.push({ "$match": { "uploadedBy.isAdmin": true } });
        }


        //query.push({ "$match": match2 });
        query.push({
            "$project": {
                type: 1,
                mimeType: 1,
                ownerId: 1,
                package: 1,
                metadata: 1,
                "uploadedBy.name": 1,
                "uploadedBy.surname": 1,
                "uploadedBy.isAdmin": 1,
                uploadDate: 1
            }
        });
        query.push({ "$count": "total" });
        var result = new RequestResult({
            code: -1
        });

        const countResult = await FileInfo.aggregate(query);
        var total = countResult[0] ? countResult[0].total : 0;
        query.pop(); //pop count
        query.push({ "$skip": skip });
        query.push({ "$limit": limit });

        const packages = await FileInfo.aggregate(query).exec();
        result.total = total;
        result.data = packages;
        result.code = 1;
        res.status(200).send(result);

    } catch (error) {
        res.status(500).send(error.stack);
    }
};

exports.listFilesByOwnerId = async function (req, res) {
    try {
 
        var result = new RequestResult({
            code: -1
        });

        var parameters = req.body;

        if (!parameters.ownerId) {
            result.data = [];
            result.total = 0;
            result.message = "Owner Id not sent";
            res.status(200).send(result);

            return;
        }

        var query = [];

        query.push({
            "$match": {
                "metadata.ownerId": new ObjectId(parameters.ownerId)
            }
        });

        query.push({
            '$lookup': {
                "from": "FileType",
                "localField": "metadata.fileType",
                "foreignField": "code",
                "as": "fileTypeModel"
            }
        });
        query.push({ "$unwind": { path: "$fileTypeModel", preserveNullAndEmptyArrays: true } });


        query.push({
            '$lookup': {
                "from": "User",
                "localField": "metadata.uploadedBy",
                "foreignField": "_id",
                "as": "uploadedByModel"
            }
        });
        query.push({ "$unwind": { path: "$uploadedByModel", preserveNullAndEmptyArrays: true } });
        query.push({ "$sort": { _id: -1 } });

        const files = await FileInfo.aggregate(query).exec();
        result.data = files;
        result.code = 1;
        res.status(200).send(result);

    } catch (error) {
        res.status(500).send(error.stack);
    }

}

exports.getFile = function (req, res) {
    try {

        var gridfsbucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            chunkSizeBytes: 1024,
            bucketName: bucketName
        });

        var result = new RequestResult({
            code: -1
        });

        var parameters = req.body;

        if (!parameters.fileId) {
            result.data = "File Id not sent"
            res.status(200).send(result);

            return;
        }

        gridfsbucket.openDownloadStream(new ObjectId(parameters.fileId)).
            pipe(res);


    } catch (error) {
        res.status(500).send(error.stack);
    }

}

exports.removeFile = function (req, res) {
    try { 
        var gridfsbucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            chunkSizeBytes: 1024,
            bucketName: bucketName
        });

        var result = new RequestResult({
            code: -1
        });

        var parameters = req.body; 

        if (!parameters.fileId) {
            result.data = "File Id not sent"
            res.status(200).send(result);

            return;
        }

        gridfsbucket.delete(new ObjectId(parameters.fileId), function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                result.code = 1;
                res.status(200).send();
            }
        });


    } catch (error) { 
        res.status(500).send(error.stack);
    }

}