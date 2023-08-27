'use strict';


module.exports = function (app) {

    var commonController = require('../controllers/commonController');

    app.route('/v1/getCities')
        .post(commonController.getCities);

    app.route('/v1/getCountries')
        .post(commonController.getCountries); 

    app.route('/v1/getParameters')
        .post(commonController.getParameters);
  
    app.route('/v1/getTowns')
        .post(commonController.getTowns); 

};