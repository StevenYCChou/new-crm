var redisService = require('../data_service/redis_service.js');
var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var redisClient = redisService.getRedisClient();

var prefix = 'session:';
var hgetallPromise = Promise.denodeify(redisClient.hgetall.bind(redisClient));
var hmsetPromise = Promise.denodeify(redisClient.hmset.bind(redisClient));
var delPromise = Promise.denodeify(redisClient.del.bind(redisClient));

exports.getSession = function(req, res) {
  hgetallPromise(prefix + req.sessionID).then(function(content) {
    if (content === null) {
      res.json({error: 'No such session yet.'});
    } else {
      res.json({
        data: content,
        links: [{
          rel: 'self',
          href: '/api/v1.00/entities/sessions/'+req.sessionID
        }]
      });
    }}, function(err) {
      res.json(err);
    });
};

exports.updateSession = function(req, res) {
  hmsetPromise(prefix + req.sessionID, req.body).then(function(content) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
  }, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
  });
};

exports.removeSession = function(req, res) {
  delPromise("crm-" + prefix + req.sessionID).then(function(content) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
  }, function(err) {
    mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
  });
};
