'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TokenSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  loginId: {
    type: mongoose.Types.ObjectId
  },
  expiry: {
    type: Number
  },
  userId: {
    value: String
  },
  value: {
    type: String
  },
  issueDate: {
    type: Date
  },
  lastUpdate: {
    type: Date
  }
}, { collection: 'Token' });

var ClaimSchema = new Schema({
  claimKeyword : {
    type: String
  },
  claimDescription : {
    type: String
  }
});

var RoleSchema = new Schema({
  role: {
    type: String
  },
  claims: {
    type: [ClaimSchema],
    default : [] 
  }
});

var UserSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  name: {
    type: String
  },
  username: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  avatar :{
    type: String
  },
  roles: {
    type: [RoleSchema],
    default : [] 
  },
  active: {
    type: Boolean,
    default: true
  }
}, { collection: 'User' }); 

module.exports = mongoose.model('Token', TokenSchema);
module.exports = mongoose.model('User', UserSchema); 