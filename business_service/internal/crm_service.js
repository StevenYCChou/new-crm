var mongodbService = require('../../data_service/mongodb_service.js');
var Agent = mongodbService.Agent;
var Customer = mongodbService.Customer;
var ContactRecord = mongodbService.ContactRecord;
var Response = mongodbService.Response;


exports.retrieveAllAgents = function() {
  return Agent.find({});
};

exports.retrieveAgentById = function(agentId) {
  return Agent.findById(agentId);
};

exports.createAgent = function (newAgent) {
  return Agent.create(newAgent);
};

exports.updateAgentById = function(agentId, updatedInfo) {
  return Agent.findByIdAndUpdate(agentId, updatedInfo);
};


// Customer related method
exports.retrieveCustomerById = function(customerId) {
  return Customer.findById(customerId);
};

exports.retrieveCustomersByAgentId = function(agentId) {
  return Customer.where('agent').equals(agentId);
};

exports.createCustomer = function(newCustomer) {
  return Customer.create(newCustomer);
};

exports.updateCustomerById = function(customerId, updatedInfo) {
  return Customer.findByIdAndUpdate(customerId, updatedInfo);
};

exports.deleteCustomerById = function(customerId) {
  return Customer.findByIdAndRemove(customerId);
};


// ContactHistory related method
exports.retrieveContactHistoryByCustomerId = function(customerId) {
  return ContactRecord.where('customer').equals(customerId);
};

exports.retrieveContactHistoryByAgentIdAndCustomerId = function(agentId, customerId) {
  return ContactRecord.where('agent').equals(agentId)
               .where('customer').equals(customerId);
};

exports.retrieveContactHistoryById = function(contactHistoryId) {
  return ContactRecord.findById(contactHistoryId);
};

exports.createContactHistory = function(newContactHistory) {
  return ContactRecord.create(newContactHistory);
};

exports.retrieveResponseByNonce = function(nonce) {
  return Response.findOne({nonce: nonce});
};

exports.createResponse = function(newResponse) {
  return Response.create(newResponse);
};

exports.updateResponseByNonce = function(nonce, response) {
  return Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: response}});
};