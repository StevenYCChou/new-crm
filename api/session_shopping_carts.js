var mongodbService = require('../data_service/mongodb_service.js')
var redisService = require('../data_service/redis_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

/*
 * GET /api/v1.00/entities/session_shopping_carts/:id
 * PUT /api/v1.00/entities/session_shopping_carts/:id
 * DELETE /api/v1.00/entities/session_shopping_carts/:id
 *
 * Rule on updating shopping cart when log-in:
 *  - GET user_shopping_carts
 *  - if a product in session_shopping_cart occurs in user_shopping_cart, we update count;
 *    otherwise, we add the new product with count
 */

var prefix = 'session:';
var suffix = ':shopping_cart';

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var delPromise = Promise.denodeify(redisClient.del.bind(redisClient));

exports.getSessionShoppingCart = function(req, res) {
  var key = prefix + req.sessionID + suffix;
  console.log(key);
  hgetallPromise(prefix + req.sessionID + suffix).then(function(cart) {
    res.json({
      data: cart,
      links: [{
        rel: 'self',
        href: '/api/v1.00/entities/session_shopping_carts/' + req.sessionID
      }]
    })}, function(err) {
      res.json(err);
    });
};

exports.updateSessionShoppingCart = function(req, res) {
  console.log(req.body);
  var update = req.body;
  var multi = redisClient.multi();
  for (var productId in update) {
    var quantity = update[productId];
    if (quantity === 0) {
      multi.hdel(prefix + req.sessionID + suffix, productId);
    } else {
      multi.hset(prefix + req.sessionID + suffix, productId, quantity);
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

exports.clearSessionShoppingCart = function(req, res) {
  delPromise(prefix + req.sessionID + suffix, function(err, reply) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
  }, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: reply}}).exec();
  });
};