var redisService = require('../data_service/redis_service.js');
var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var product_prefix = 'product_view_stats:',
    category_prefix = 'category_view_stats:';

exports.getSessionViewStats = function(req, res) {
  var product_key = product_prefix + req.params.id;
  var category_key = category_prefix + req.params.id;

  var productPromise = hgetallPromise(product_key);
  var categoryPromise = hgetallPromise(category_key);
  Promise.all([productPromise, categoryPromise]).then(function(results) {
    var products = results[0],
        categories = results[1];
    res.json({
      data: {
        products: products,
        categories: categories
      },
      links: [{
        rel: 'self',
        href: '/api/v1.00/entities/session_view_stats/'+req.params.id
      }]
    });
  }, function(err) {
    res.json(err);
  });
};

exports.updateSessionViewStats = function(req, res) {
  var product_key = product_prefix + req.params.id;
  var category_key = category_prefix + req.params.id;

  var multi = redisClient.multi();
  if (req.body.products) {
    for (var attribute_key in req.body.products) {
      multi.hincrby(product_key, attribute_key, req.body.products[attribute_key]);
    }
  }
  if (req.body.categories) {
    for (var attribute_key in req.body.categories) {
      multi.hincrby(category_key, attribute_key, req.body.categories[attribute_key]);
    }
  }

  multi.exec(function(err, content) {
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
    }
  });
};

exports.removeSessionViewStats = function(req, res) {
  var product_key = product_prefix + req.params.id;
  var category_key = category_prefix + req.params.id;

  var multi = redisClient.multi();
  multi.del(product_key);
  multi.del(category_key);

  multi.exec(function(err, content) {
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
    }
  });
};