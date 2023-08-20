'use strict';
/*
Module:multer
multer is middleware used to handle multipart form data
*/
var multer = require('multer');
var multerupload = multer({ dest: 'fileupload/' })

module.exports = function (app) {

    var fileController = require('../controllers/fileController');

    app.route('/v1/uploadFile')
        .post(multerupload.any(), fileController.uploadFile);

    app.route('/v1/listFiles')
        .post(fileController.listFiles);

    app.route('/v1/listFilesByOwnerId')
        .post(fileController.listFilesByOwnerId);

    app.route('/v1/getFile')
        .post(fileController.getFile);

    app.route('/v1/removeFile')
        .post(fileController.removeFile);

};