'use strict';
var mongoose = require('mongoose');
const { Mixed } = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  key: {
    type: String
  },
  value: {
    type: Mixed
  },
}, { collection: 'Test' }); 

module.exports = mongoose.model('Test', TestSchema); 