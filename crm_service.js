var model = require('./model.js');

exports.addAgent = function (newAgent, callback) {
  models['Agent'].create(newAgent, callback);
};

exports.getAllAgents = function(callback) {
  models['Agent'].find({}, callback);
};

exports.getAgentByID = function(agentID, callback) {
  models['Agent'].findById(agentID).populate('customers').exec(callback);
};