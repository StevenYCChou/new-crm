var configs = require('./configs.js');
var shoppingCartService = require('./business_service/shopping_cart.js');
var redisService = require('./data_service/redis_service');
var redisClient = redisService.getRedisClient();
/*
app.get('/api/v1.00/entities/shoppingcarts/users/:userid', shoppingCartApi.getUserShoppingCart);
*/

var REDIS_SESSION_PREFIX = configs.REDIS_SESSION_PREFIX;

function getShoppingCart(req, res) {
  var session;
  if (typeof req.param('session') === 'undefined')
    session = REDIS_SESSION_PREFIX + req.sessionID;
  else
    session = REDIS_SESSION_PREFIX + req.param('session');

  shoppingCartService.getShoppingCart(session, function (err, cart) {
    if (err) {
      res.status = 404;
      res.json({err: err.message});
    } else {
      res.status = 202;
      res.json(cart);
    }
  });
}

function updateShoppingCart(req, res) {
  var update = req.body;
  var session;
  if (typeof req.param('session') === 'undefined')
    session = REDIS_SESSION_PREFIX + req.sessionID;
  else
    session = REDIS_SESSION_PREFIX + req.param('session');

  shoppingCartService.updateShoppingCart(session, update, function(err, cart) {
    if (err) {
      res.status = 404;
      res.json({err: err.message});
    } else {
      res.json(cart);
    }
  });
}

function clearShoppingCart(req, res) {
  var session;
  if (typeof req.param('session') === 'undefined')
    session = REDIS_SESSION_PREFIX + req.sessionID;
  else
    session = REDIS_SESSION_PREFIX + req.param('session');

  shoppingCartService.clearShoppingCart(session, function(err, cart) {
    if (err) {
      res.status = 404;
      res.json({err: err.message});
    } else {
      res.status = 202;
      res.json(cart);
    }
  })
}

exports.getShoppingCart = getShoppingCart;
exports.updateShoppingCart = updateShoppingCart;
exports.clearShoppingCart = clearShoppingCart;
