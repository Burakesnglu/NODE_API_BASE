'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApiResponseSchema = new Schema({
    isSuccessful: {
        type: Boolean
    },
    code: {
        type: String
    },
    message: {
        type: String
    }
});

var RequestSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true,
    },
    remoteAddress: {
        type: String
    },
    xForwardedFor: {
        type: String
    },
    url: {
        type: String
    },
    headers: {
        type: mongoose.Schema.Types.Mixed
    },
    body: {
        type: mongoose.Schema.Types.Mixed
    }
}, { collection: 'Request' });

var ResponseSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true,
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId
    },
    url: {
        type: String
    },
    status: {
        type: Number
    },
    headers: {
        type: mongoose.Schema.Types.Mixed
    },
    body: {
        type: mongoose.Schema.Types.Mixed
    }
}, { collection: 'Response' });

var RequestResultSchema = new Schema({ 
    code : {
        type: Number
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    message : {
        type: String
    },
    total: {
        type: Number 
    }
} );

module.exports = mongoose.model('ApiResponse', ApiResponseSchema);
module.exports = mongoose.model('Request', RequestSchema);
module.exports = mongoose.model('Response', ResponseSchema);
module.exports = mongoose.model('RequestResult', RequestResultSchema);