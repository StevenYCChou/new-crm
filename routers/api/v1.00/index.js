var express = require('express');
var router = express.Router();

var hash = require('object-hash');
var mongodbService = require('../../../data_service/mongodb_service.js');
var restfulHelper = require('../../../api/restful_helper.js');

var appendUUID = function(req, res, next) {
  req.headers.uuid = hash(req.headers);
  req.headers.uuid = hash(req.originalUrl);
  req.headers.uuid += hash(req.body);
  next();
};

var responsePollingPage = function(req, res, next) {
  var method = req.method;
  if (method === 'PUT' || method === 'POST' || method === 'DELETE') {
    var reqUUID = req.headers.uuid;
    restfulHelper.responsePollingPage(res, reqUUID);
  }
  next();
};

var dectectAndRestoreUUID = function(req, res, next) {
  var method = req.method;
  if (method === 'PUT' || method === 'POST' || method === 'DELETE') {
    var reqUUID = req.headers.uuid;
    mongodbService.Response.findOne({nonce: reqUUID}).exec().then(function(entry) {
      if (entry === null) {
        mongodbService.Response.create({nonce: reqUUID}).then(function(entry) {
          next();
        }, function(err) {
          res.status(500).end();
        });
      } else {
        console.log('In dectectAndRestoreUUID: detect duplication.');
      };
    }, function(err) {
      res.status(500).end();
    });
  } else {
    next();
  }
};

router.use(appendUUID);
router.use(responsePollingPage);

// process session related data before detect duplication, 
// because we don't want to detect duplication for session related entities
router.use('/entities/sessions', require('./entities/sessions.js'));
router.use('/entities/session_view_stats', require('./entities/session_view_stats.js'));
router.use('/entities/session_shopping_carts', require('./entities/session_shopping_carts.js'));

router.use(dectectAndRestoreUUID);
router.use('/entities/agents', require('./entities/agents.js'));
router.use('/entities/customers', require('./entities/customers.js'));
router.use('/entities/contact_records', require('./entities/contact_records.js'));
router.use('/entities/products', require('./entities/products.js'));
router.use('/entities/user_view_stats', require('./entities/user_view_stats.js'));
router.use('/entities/user_shopping_carts', require('./entities/user_shopping_carts.js'));
router.use('/entities/responses', require('./entities/responses.js'));

var actions = require('../../../api/actions.js');
router.put('/actions/import_view_stats', actions.importViewStats);
router.put('/actions/import_shopping_cart', actions.importShoppingCart)

module.exports = router;