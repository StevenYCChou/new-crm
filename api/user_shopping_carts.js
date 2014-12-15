var mongodbService = require('../data_service/mongodb_service.js')
var redisService = require('../data_service/redis_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

/*
 * GET /api/v1.00/entities/user_shopping_carts/:id
 * PUT /api/v1.00/entities/user_shopping_carts/:id
 * DELETE /api/v1.00/entities/user_shopping_carts/:id
 *
 * Rule on updating shopping cart when log-in:
 *  - GET user_shopping_carts
 *  - if a product in session_shopping_cart occurs in user_shopping_cart, we update count;
 *    otherwise, we add the new product with count
 */

var prefix = 'user:';
var suffix = ':shopping_cart';

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var delPromise = Promise.denodeify(redisClient.del.bind(redisClient));

exports.getUserShoppingCart = function(req, res) {
  var redis_key = prefix + req.params.id + suffix;
  hgetallPromise(redis_key).then(function(cart) {
    res.json({
      data: cart,
      links: [{
        rel: 'self',
        href: '/api/v1.00/entities/user_shopping_carts/' + req.params.id
      }]
    })}, function(err) {
      res.json(err);
    });
};

exports.updateUserShoppingCart = function(req, res) {
  var update = req.body;

  var redis_key = prefix + req.params.id + suffix;
  var multi = redisClient.multi();
  for (var productId in update) {
    var quantity = update[productId];

    if (quantity === 0) {
      multi.hdel(redis_key, productId);
    } else {
      multi.hset(redis_key, productId, quantity);
    }
  }

  multi.exec(function(err, replies) {
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: replies}}).exec();
    }
  });
};

exports.clearUserShoppingCart = function(req, res) {
  var redis_key = prefix + req.params.id + suffix;

  delPromise(redis_key, function(err, content) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
  }, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
  });
};