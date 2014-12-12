var mongodbService = require('./data_service/mongodb_service.js')
var redisService = require('./data_service/redis_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

/*
 * GET /api/v1.00/entities/session_shopping_carts/:id
 * PUT /api/v1.00/entities/session_shopping_carts/:id
 * DELETE /api/v1.00/entities/session_shopping_carts/:id
 * GET /api/v1.00/entities/user_shopping_carts/:id
 * PUT /api/v1.00/entities/user_shopping_carts/:id
 * DELETE /api/v1.00/entities/user_shopping_carts/:id
 *
 * Rule on updating shopping cart when log-in:
 *  - GET user_shopping_carts
 *  - if a product in session_shopping_cart occurs in user_shopping_cart, we update count;
 *    otherwise, we add the new product with count
 */

var prefix = 'session:';
var suffix = ':shoppingCart'

var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var delPromise = Promise.denodeify(redisClient.del.bind(redisClient));

exports.mergeSessionAndUserShoppingCart = function(sessionId, userId) {
  var multi = redisClient.multi();
  multi.hgetall(prefix + sessionId + suffix);
  multi.hgetall(userId + suffix);
  mutli.del(prefix + sessionId + suffix);
  multi.del(userId + suffix);

  multi.exec(function(err, replies) {
    sessionCart = replies[0];
    userCart = replies[1];
    // merge.
    for (productId in sessionCart) {
      userCart[proudctId] = sessionCart[productId];
    }
    multi.hmset(prefix + sessionId + suffix, userCart);
    multi.hmset(userId + suffix, userCart);
    multi.exec(function(err, replies) {
      if (err) {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
      } else {
        mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
      }
    });
  });
}

exports.getSessionShoppingCart = function(req, res) {
  hgetallPromise(prefix + req.sessionID + suffix).then(function(cart) {
    res.json({
      data: cart,
      links: [{
        rel: 'self',
        href: '/api/v1.00/entities/session_shopping_carts'
      }]
    }, function(err) {
      res.json(err);
    });
  });
};

exports.getUserShoppingCart = function(req, res) {
  hgetallPromise(prefix + req.param.id + suffix).then(function(cart) {
    res.json({
      data: cart,
      links: [{
        rel: 'self',
        href: '/api/v1.00/entities/user_shopping_carts/'+req.param.id
      }]
    }, function(err) {
      res.json(err);
    });
  });
};

exports.updateSessionShoppingCart = function(req, res) {
  var update = req.body;
  var multi = redisClient.multi();
  for (productId in update) {
    var quantity = update[productId];
    if (quantity == 0) {
      multi.hdel(prefix + req.sessionID + suffix, productId);
    } else {
      multi.hset(prefix + req.sessionID + suffix, productId, quantity);
    }
  }

  multi.exec(function(err, replies) {
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
    }
  });
};

exports.updateUserShoppingCart = function(req, res) {
  var update = req.body;
  var multi = redisClient.multi();
  for (productId in update) {
    var quantity = update[productId];
    if (quantity == 0) {
      multi.hdel(prefix + req.param.id + suffix, productId);
    } else {
      multi.hset(prefix + req.param.id + suffix, productId, quantity);
    }
  }

  multi.exec(function(err, replies) {
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
    }
  });
};

exports.clearSessionShoppingCart = function(req, res) {
  delPromise(prefix + req.sessionID + suffix, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
  }, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
  });
};

exports.clearUserShoppingCart = function(req, res) {
  delPromise(prefix + req.param.id + suffix, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
  }, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
  });
};
