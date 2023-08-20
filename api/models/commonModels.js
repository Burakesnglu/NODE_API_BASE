'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CitySchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String
  },
  code: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, { collection: 'City' });

var CountrySchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  order: {
    type: Number
  },
  name: {
    type: String
  },
  phoneCode: {
    type: String
  },
  code1: {
    type: String
  },
  code2: {
    type: String
  },
  name2: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, { collection: 'Country' });

var FileInfoMetaDataSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  mimeType: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  filename: {
    type: String
  },
  fileType: {
    type: Number
  }
},);

var FileInfoSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  length: {
    type: Number
  },
  uploadDate: {
    type: Date
  },
  filename: {
    type: String
  },
  md5: {
    type: String
  },
  metadata: {
    type: FileInfoMetaDataSchema
  }
}, { collection: 'fs.files' });

var FileTypeSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  code: {
    type: Number
  },
  name: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, { collection: 'FileType' });

var ParameterSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  key: {
    type: String
  },
  type: {
    type: String
  },
  valueType: {
    type: String
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  }
}, { collection: 'Parameter' });

var TownSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, { collection: 'Town' });

module.exports = mongoose.model('City', CitySchema);
module.exports = mongoose.model('Country', CountrySchema);
module.exports = mongoose.model('FileInfo', FileInfoSchema);
module.exports = mongoose.model('FileInfoMetaData', FileInfoMetaDataSchema);
module.exports = mongoose.model('FileType', FileTypeSchema);
module.exports = mongoose.model('Parameter', ParameterSchema);
module.exports = mongoose.model('Town', TownSchema);