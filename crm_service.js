var model = require('./model.js');

exports.addAgent = function (newAgent, callback) {
  models['Agent'].create(newAgent, callback);
};

exports.getAllAgents = function(callback) {
  models['Agent'].find({}, callback);
};

exports.getAgentById = function(agentId, callback) {
  models['Agent'].findById(agentId).populate('customers').exec(callback);
};

exports.getCustomerById = function(customerId, callback) {
  models['Customer'].findById(customerId).populate('agent').populate('contactHistory').exec(callback);
};

exports.updateAgentById = function(agentId, updatedInfo, callback) {
  models['Agent'].findOneAndUpdate(agentId, updatedInfo, callback);
};