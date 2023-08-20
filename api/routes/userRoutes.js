'use strict';


module.exports = function (app) {

    var userController = require('../controllers/userController');

    //Login
    app.route('/auth/login').post(userController.login);

    //Users
    app.route('/v1/getUsers').post(userController.getUsers);
    app.route('/v1/saveUser').post(userController.saveUser);

};