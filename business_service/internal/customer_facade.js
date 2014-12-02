var configs = require('../../configs.js');
var crmService = require('./crm_service.js');
var viewedHistoryService = require('../viewed_history_service.js');

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
  // update viewed history.
  var session = REDIS_SESSION_PREFIX + req.sessionID;
  var update = {
    // TODO;
    product: req.param('productId'),
  }
  console.log(update);
  console.log(req.url);
  viewedHistoryService.updateViewedHistory(session, update, function(err, callback) {
    if (err) {
      res.status(500);
      res.send({err: err.message});
    } else {
      res.render('customer/productDetail');
    }
  });
};
