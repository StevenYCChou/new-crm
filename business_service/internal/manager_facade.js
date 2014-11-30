var crmService = require('./crm_service.js');

exports.showAllAgents = function(req, res) {
  res.render('manager/agent/index');
};

exports.showAgentCreationPage = function (req, res) {
  res.render('manager/agent/create');
};

exports.showProductsPage = function (req, res) {
  res.render('manager/products');
};

exports.createProductsPage = function (req, res) {
  res.render('manager/createProduct');
};

exports.showProductDetail = function (req, res) {
  res.render('manager/productDetail');
};