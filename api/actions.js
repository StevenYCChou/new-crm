var redisService = require('../data_service/redis_service.js');
var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var delPromise = Promise.denodeify(redisClient.del.bind(redisClient));

var productPrefix = 'product_view_stats:',
    categoryPrefix = 'category_view_stats:';

exports.importViewStats = function(req, res) {
  var sessionId = req.body.sessionId || '';
  var userId = req.body.userId || '';
  var sessionProductKey = productPrefix + sessionId,
      sessionCategoryKey = categoryPrefix + sessionId,
      userProductKey = productPrefix + userId,
      userCategoryKey = categoryPrefix + userId;

  var productPromise = hgetallPromise(sessionProductKey);
  var categoryPromise = hgetallPromise(sessionCategoryKey);
  Promise.all([productPromise, categoryPromise]).then(function(results) {
    var productViews = results[0],
        categoryViews = results[1];
    var multi = redisClient.multi();
    if (productViews) {
      for (var attributeKey in productViews) {
        multi.hincrby(userProductKey, attributeKey, productViews[attributeKey]);
      }
    }
    if (categoryViews) {
      for (var attributeKey in categoryViews) {
        multi.hincrby(userCategoryKey, attributeKey, categoryViews[attributeKey]);
      }
    }

    multi.exec(function(err, content) {
      if (err) {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
      } else {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
      }
    });
  });
};


var sessionPrefix = 'session:'
  , userPrefix = 'user:'
  , suffix = ':shoppingCart';
exports.importShoppingCart = function(req, res) {
  var sessionId = req.sessionID || '';
  var userId = req.body.userId || '';

  var multi = redisClient.multi();
  multi.hgetall(sessionPrefix + sessionId + suffix);
  multi.hgetall(userPrefix + userId + suffix);
  mutli.del(sessionPrefix + sessionId + suffix);
  multi.del(userPrefix + userId + suffix);

  multi.exec(function(err, replies) {
    sessionCart = replies[0];
    userCart = replies[1];
    // merge.
    for (productId in sessionCart) {
      userCart[proudctId] = sessionCart[productId];
    }
    multi.hmset(sessionPrefix + sessionId + suffix, userCart);
    multi.hmset(userPrefix + userId + suffix, userCart);
    multi.exec(function(err, replies) {
      if (err) {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
      } else {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
      }
    });
  });
}