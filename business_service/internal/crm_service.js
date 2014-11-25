var mongodbService = require('../../data_service/mongodb_service.js');
var Agent = mongodbService.Agent;
var Customer = mongodbService.Customer;
var ContactRecord = mongodbService.ContactRecord;
var Response = mongodbService.Response;

exports.createAgent = function (newAgent, callback) {
  Agent.create(newAgent, callback);
};

exports.retrieveAllAgents = function(callback) {
  Agent.find({}, callback);
};

exports.retrieveAgentById = function(agentId, callback) {
  Agent.findById(agentId).populate('customers').exec(callback);
};

exports.updateAgentById = function(agentId, updatedInfo, callback) {
  Agent.findByIdAndUpdate(agentId, updatedInfo, callback);
};


// Customer related method
exports.retrieveCustomerById = function(customerId, callback) {
  Customer.findById(customerId).populate('agent').exec(callback);
};

exports.retrieveCustomersByAgentId = function(agentId, callback) {
  Customer.where('agent').equals(agentId).exec(callback);
};

exports.createCustomer = function(newCustomer, callback) {
  Customer.create(newCustomer, callback);
};

exports.updateCustomerById = function(customerId, updatedInfo, callback) {
  Customer.findByIdAndUpdate(customerId, updatedInfo, callback);
};

exports.deleteCustomerById = function(customerId, callback) {
  Customer.findByIdAndRemove(customerId, callback);
};


// ContactHistory related method
exports.retrieveContactHistoryByCustomerId = function(customerId, callback) {
  ContactRecord.where('customer').equals(customerId).exec(callback);
};

exports.retrieveContactHistoryByAgentIdAndCustomerId = function(agentId, customerId, callback) {
  ContactRecord.where('agent').equals(agentId)
               .where('customer').equals(customerId)
               .exec(callback);
};

exports.retrieveContactHistoryById = function(contactHistoryId, callback) {
  ContactRecord.findById(contactHistoryId).exec(callback);
};

exports.createContactHistory = function(newContactHistory, callback) {
  ContactRecord.create(newContactHistory, callback);
};

exports.retrieveResponseByNonce = function(nonce, callback) {
  Response.findOne({nonce: nonce}, callback);
};

exports.createResponse = function(newResponse, callback) {
  Response.create(newResponse, callback);
};

exports.updateResponseByNonce = function(nonce, response, callback) {
  Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: response}}, callback);
};