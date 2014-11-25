var mongodbService = require('../data_service/mongodb_service.js');
var Agent = mongodbService.Agent;
var Subscription = mongodbService.Subscription;

exports.showAllAgents = function (req, res) {
  res.render('subscription/index')
}

exports.showAgentSubscriptions = function (req, res) {
  res.render('subscription/retrieve');
};

exports.showSubscriptionCreationPage = function (req, res) {
  res.render('subscription/create');
};

exports.showSubscriptionUpdatePage = function (req, res) {
  res.render('subscription/update');
};
