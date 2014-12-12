var redisService = require('../data_service/redis_service.js');
var mongodbService = require('../data_service/mongodb_service.js');
var redisClient = redisService.getRedisClient();

exports.getSession = function(req, res) {
  redisClient.hgetall('session:'+req.params.id, function(err, content) {
    if (err) {
      res.json(err);
    } else if (content == null) {
      res.json({error: 'No such session yet.'});
    } else {
      res.json({
        data: content,
        links: [{
          rel: 'self',
          href: '/api/v1.00/entities/sessions/'+req.params.id
        }]
      });
    }
  });
};

exports.updateSession = function(req, res) {
  console.log(req.body);
  console.log(req.params.id);
  redisClient.hmset('session:'+req.params.id, req.body, function(err, content) {
    console.log(err);
    console.log(content);
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
    }
  })
};

exports.removeSession = function(req, res) {
  redisClient.del('session:'+req.params.id, function(err, content) {
    if (err) {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: content}}).exec();
    }
  })
};