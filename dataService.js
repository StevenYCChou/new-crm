var model = require('./model.js');

// Agent related method
exports.addAgent = function (newAgent, callback) {
  models['Agent'].create(newAgent, callback);
};

exports.getAllAgents = function(callback) {
  models['Agent'].find({}, callback);
};

exports.getAgentById = function(agentId, callback) {
  models['Agent'].findById(agentId).populate('customers').exec(callback);
};

exports.updateAgentById = function(agentId, updatedInfo, callback) {
  models['Agent'].findByIdAndUpdate(agentId, updatedInfo, callback);
};


// Customer related method
exports.getCustomerById = function(customerId, callback) {
  models['Customer'].findById(customerId).populate('agent').exec(callback);
};

exports.getCustomersByAgentId = function(agentId, callback) {
  models['Customer'].where('agent').equals(agentId).exec(callback);
};

exports.addCustomer = function(newCustomer, callback) {
  models['Customer'].create(newCustomer, callback);
};

exports.updateCustomerById = function(customerId, updatedInfo, callback) {
  models['Customer'].findByIdAndUpdate(customerId, updatedInfo, callback);
};

exports.deleteCustomerById = function(customerId, callback) {
  models['Customer'].findByIdAndRemove(customerId, callback);
};


// ContactHistory related method
exports.getContactHistoryByCustomerId = function(customerId, callback) {
  models['ContactHistory'].where('customer').equals(customerId).exec(callback);
};

exports.getContactHistoryByAgentIdAndCustomerId = function(agentId, customerId, callback) {
  models['ContactHistory'].where('agent').equals(agentId)
                          .where('customer').equals(customerId)
                          .exec(callback);
};

exports.getContactHistoryById = function(contactHistoryId, callback) {
  models['ContactHistory'].findById(contactHistoryId).exec(callback);
};

exports.addContactHistory = function(newContactHistory, callback) {
  models['ContactHistory'].create(newContactHistory, callback);
};
