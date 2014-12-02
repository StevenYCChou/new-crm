var redisService = require('../data_service/redis_service');
var redisClient = redisService.getRedisClient();

function getSessionContent(session, callback) {
  redisClient.hgetall(session, function(err, content) {
    if (err) {
      callback(err);
    } else if (content == null) {
      callback(new Error('No such session yet.'));
    } else {
      callback(null, content);
    }
  });
}

exports.getSessionContent = getSessionContent;
