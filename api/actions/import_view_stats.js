var redisService = require('../../data_service/redis_service.js');
var mongodbService = require('../../data_service/mongodb_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
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