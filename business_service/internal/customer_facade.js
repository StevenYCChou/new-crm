var configs = require('../../configs.js');
var crmService = require('./crm_service.js');
var viewedHistoryService = require('../viewed_history_service.js');
var crmSimpleDb = require('../../crm_aws_module/simpleDb.js');

var REDIS_SESSION_PREFIX = configs.REDIS_SESSION_PREFIX;

exports.retrieveProfilePage = function(req, res) {
  res.render('customer/retrieve');
};

exports.showProfileUpdatePage = function (req, res) {
  res.render('customer/update');
};

exports.showProductsPage = function (req, res) {
  res.render('customer/products');
};

exports.showProductDetail = function (req, res) {
  res.render('customer/productDetail');
};

exports.showViewStats = function (req, res) {
  res.render('customer/viewStats');
};

exports.showShoppingCarts = function (req, res) {
  res.render('customer/shoppingCarts');
};
