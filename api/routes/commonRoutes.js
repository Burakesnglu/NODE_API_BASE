'use strict';


module.exports = function (app) {

    var commonController = require('../controllers/commonController');

    app.route('/v1/getCities')
        .get(commonController.getCities);

    app.route('/v1/getCountries')
        .get(commonController.getCountries); 

    app.route('/v1/getParameters')
        .get(commonController.getParameters);
  
    app.route('/v1/getTowns')
        .get(commonController.getTowns); 

};