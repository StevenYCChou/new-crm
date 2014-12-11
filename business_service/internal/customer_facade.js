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
  var session = REDIS_SESSION_PREFIX + req.sessionID;
  var product = req.param('productId');

  crmSimpleDb.getProductAttributes(product, ['Category'], function(err, data) {
    if (err) {
      res.status(500);
      res.send({err: err.stack});
    } else {
      var categories = new Array();
      categories = data.Attributes[0].Value.split(',');
      var update = {
        product: req.param('productId'),
        categories: categories,
      }

      viewedHistoryService.updateViewedHistory(session, update, function(err, callback) {
        if (err) {
          res.status(500);
          res.send({err: err.message});
        } else {
          res.render('customer/productDetail');
        }
      });
    }
  })
};
