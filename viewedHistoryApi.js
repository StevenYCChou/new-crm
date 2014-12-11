var configs = require('./configs.js');
var viewedHistoryService = require('./business_service/viewed_history_service.js');
var redisService = require('./data_service/redis_service');
var redisClient = redisService.getRedisClient();

/*
app.get('/api/v1.00/entities/users/:userId/viewedHistory', viewedHistoryApi.getViewedHistory);
app.put('/api/v1.00/entities/users/:userId/viewedHistory', viewedHistoryApi.updateViewedHistory);
*/
var REDIS_SESSION_PREFIX = configs.REDIS_SESSION_PREFIX;

function getViewedHistory(req, res) {
  var session = REDIS_SESSION_PREFIX + req.sessionID;

  viewedHistoryService.getViewedHistory(session, req.session.userId, function(err, viewedHistory) {
    if (err) {
      res.status(500);
      res.json({err: err.message});
    } else {
      res.status(200);
      res.json(viewedHistory);
    }
  });
}

function getSessionViewedHistory(req, res) {
  var session = REDIS_SESSION_PREFIX + req.sessionID;

  viewedHistoryService.getSessionViewedHistory(session, function(err, viewedHistory) {
    if (err) {
      res.status(500);
      res.json({err: err.message});
    } else {
      res.status(200);
      res.json(viewedHistory);
    }
  })
}

function getUserViewedHistory(req, res) {
  var session = REDIS_SESSION_PREFIX + req.sessionID;

  viewedHistoryService.getUserViewedHistory(session, function(err, viewedHistory) {
    if (err) {
      res.status(500);
      res.json({err: err.message});
    } else {
      res.status(200);
      res.json(viewedHistory);
    }
  })
}

function updateViewedHistory(req, res) {
  var session = REDIS_SESSION_PREFIX + req.sessionID;
  var viewedProduct = req.param('productId');
  var viewedCategories = req.param('categories'); // Array

  var update = {
    viewedProduct: viewedProduct,
    viewedCategories: viewedCategories,
  };

  viewedHistoryService.updateViewedHistory(session, update, function(err, viewedHistory) {
    if (err) {
      res.status(500);
      res.json({err: err.message});
    } else {
      res.status(200);
      res.json(viewedHistory);
    }
  })
}

exports.getViewedHistory = getViewedHistory;
exports.getSessionViewedHistory = getSessionViewedHistory;
exports.getUserViewedHistory = getUserViewedHistory;
exports.updateViewedHistory = updateViewedHistory;
