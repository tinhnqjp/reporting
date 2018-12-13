'use strict';

/**
 * Module dependencies
 */
var foodsPolicy = require('../policies/foods.server.policy'),
  foods = require('../controllers/foods.server.controller');

module.exports = function (app) {
  // process for /api/foods/***
  app.route('/api/foods/report').get(foodsPolicy.isAllowed, foods.report);
  app.route('/api/foods/export').post(foodsPolicy.isAllowed, foods.export);

  // Foods collection routes
  app.route('/api/foods').post(foodsPolicy.isAllowed, foods.create);
  app.route('/api/foods/list').post(foodsPolicy.isAllowed, foods.list);
  app.route('/api/foods/import').post(foodsPolicy.isAllowed, foods.import);

  // Single food routes
  app.route('/api/foods/:foodId')
    .get(foodsPolicy.isAllowed, foods.read)
    .put(foodsPolicy.isAllowed, foods.update)
    .delete(foodsPolicy.isAllowed, foods.delete);

  // Finish by binding the food middleware
  app.param('foodId', foods.foodByID);
};
