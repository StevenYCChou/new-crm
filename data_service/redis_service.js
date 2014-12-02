var redis = require('redis');
var configs = require('../configs.js');

function getRedisClient() {
  return redis.createClient(configs.redis.port, configs.redis.host);
}

exports.getRedisClient = getRedisClient;

