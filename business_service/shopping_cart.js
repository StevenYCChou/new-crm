var sessionService = require('./session.js');
var redisService = require('../data_service/redis_service');

var redisClient = redisService.getRedisClient();

function getShoppingCart(session, callback) {
  sessionService.getSessionContent(session, function (err, content) {
    if (err) {
      callback(err);
    } else {
      redisClient.hgetall(content.shoppingCart, function (err, cart) {
        if (err) {
          callback(err);
        } else {
          callback(null, cart);
        }
      });
    }
  });
}

// TODO: add simpleDB.
function updateShoppingCart(session, update, callback) {
  sessionService.getSessionContent(session, function (err, content) {
    if (err) {
      callback(err);
    } else {
      var cart = content.shoppingCart;
      for (id in update) {
        var quantity = update[id];
        if (quantity == 0) {
          redisClient.hdel(cart, id);
        } else {
          redisClient.hset(cart, id, quantity, function(err, result){
            // TODO;
          });
        }
      }
      redisClient.hgetall(cart, function(err, cart) {
        if (err) {
          callback(err);
        } else {
          callback(null, cart);
        }
      });
    }
  });
}

function clearShoppingCart(session, callback) {
  sessionService.getSessionContent(session, function (err, content) {
    if (err) {
      // how to handle error????
    } else {
      var cart = content.shoppingCart;
      redisClient.del(cart, function (err) {
        if (err) {
          // handle error.
        } else {
          redisClient.hset(cart, null, null, function(err, cart) {
            if (err) {
              // handle error.
            } else {
              callback(null, cart);
            }
          })
        }
      })
    }
  });
}

exports.getShoppingCart = getShoppingCart;
exports.updateShoppingCart = updateShoppingCart;
exports.clearShoppingCart = clearShoppingCart;
