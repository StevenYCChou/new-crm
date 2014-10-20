var mongoose = require('mongoose');
var agentSchema = require('./schemas/agent_schema.js');
var customerSchema = require('./schemas/customer_schema.js');
var contactRecordSchema = require('./schemas/contact_record_schema.js');

// Define model with Schema
mongoose.model('Agent', agentSchema);
mongoose.model('Customer', customerSchema);
mongoose.model('ContactRecord', contactRecordSchema);

console.log('Try to connect to MongoDB via Mongoose ...');
var default_db = 'mongodb://localhost/mydb';
var conn = mongoose.createConnection(default_db);
conn.on('error', console.error.bind(console, 'Mongoose connection error:'));

var Agent = conn.model('Agent');
var Customer = conn.model('Customer');
var ContactRecord = conn.model('ContactRecord');

exports.addAgent = function (newAgent, callback) {
  Agent.create(newAgent, callback);
};

exports.getAllAgents = function(callback) {
  Agent.find({}, callback);
};

exports.getAgentById = function(agentId, callback) {
  Agent.findById(agentId).populate('customers').exec(callback);
};

exports.updateAgentById = function(agentId, updatedInfo, callback) {
  Agent.findByIdAndUpdate(agentId, updatedInfo, callback);
};


// Customer related method
exports.getCustomerById = function(customerId, callback) {
  Customer.findById(customerId).populate('agent').exec(callback);
};

exports.getCustomersByAgentId = function(agentId, callback) {
  Customer.where('agent').equals(agentId).exec(callback);
};

exports.addCustomer = function(newCustomer, callback) {
  Customer.create(newCustomer, callback);
};

exports.updateCustomerById = function(customerId, updatedInfo, callback) {
  Customer.findByIdAndUpdate(customerId, updatedInfo, callback);
};

exports.deleteCustomerById = function(customerId, callback) {
  Customer.findByIdAndRemove(customerId, callback);
};


// ContactHistory related method
exports.getContactHistoryByCustomerId = function(customerId, callback) {
  ContactRecord.where('customer').equals(customerId).exec(callback);
};

exports.getContactHistoryByAgentIdAndCustomerId = function(agentId, customerId, callback) {
  ContactRecord.where('agent').equals(agentId)
               .where('customer').equals(customerId)
               .exec(callback);
};

exports.getContactHistoryById = function(contactHistoryId, callback) {
  ContactRecord.findById(contactHistoryId).exec(callback);
};

exports.addContactHistory = function(newContactHistory, callback) {
  ContactRecord.create(newContactHistory, callback);
};
