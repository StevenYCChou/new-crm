var redisService = require('../data_service/redis_service.js');
var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var delPromise = Promise.denodeify(redisClient.del.bind(redisClient));

var productPrefix = 'product_view_stats:',
    categoryPrefix = 'category_view_stats:';

exports.importViewStats = function(req, res) {
  var sessionId = req.sessionId || '';
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


var sessionPrefix = 'session:',
    userPrefix = 'user:',
    suffix = ':shoppingCart';

exports.importShoppingCart = function (req, res) {
  var sessionId = req.sessionID || '';
  var userId = req.body.userId || '';
  var sessionShoppingCartKey = sessionPrefix + sessionId + suffix,
      userShoppingCartKey = userPrefix + userId + suffix;

  var multi = redisClient.multi();
  multi.hgetall(sessionShoppingCartKey);
  multi.hgetall(userShoppingCartKey);

  multi.exec(function(err, replies) {
    sessionCart = replies[0];
    userCart = replies[1] == null ? {} : replies[1]; // Cannot set property to `null` object.

    if (!sessionCart)
      multi.del(sessionShoppingCartKey);
    if (!userCart)
      multi.del(userShoppingCartKey);

    if (sessionCart != null || userCart != null) {
      // Rules on updating shopping cart when log-in:
      //  - If a product in session_shopping_cart occurs in user_shopping_cart,
      //    we update count based on the session.
      //  - Otherwise, we add the new product with count into user_shopping_cart.
      //  - Finally, we overwrite session_shopping_cart.
      for (var productId in sessionCart)
        userCart[productId] = sessionCart[productId];
      multi.hmset(sessionShoppingCartKey, userCart);
      multi.hmset(userShoppingCartKey, userCart);
    }

    multi.exec(function(err, replies) {
      if (err) {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
      } else {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
      }
    });
  });
}
