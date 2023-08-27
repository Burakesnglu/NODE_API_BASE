'use strict';


module.exports = function (app) {

    var commonController = require('../controllers/commonController');

    app.route('/public/test')
        .post(commonController.getTest);

};