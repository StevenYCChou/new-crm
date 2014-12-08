var agentAPI = require('./api/agents.js');
var customerAPI = require('./api/customers.js');
var contactRecordAPI = require('./api/contact_records.js');
var productAPI = require('./api/products.js');

var mongodbService = require('./data_service/mongodb_service.js');
var AWS = require('aws-sdk');
var configs = require('./configs.js');
var simpledb = new AWS.SimpleDB({credentials: configs.simpleDb.creds, region: configs.simpleDb.region});
var dynamodb = new AWS.DynamoDB({credentials: configs.dynamoDb.creds, region: configs.dynamoDb.region});
var s3 = new AWS.S3({credentials: configs.s3.creds, region: configs.s3.region});
var dynamoJSON = require('dynamodb-data-types').AttributeValue;

var Promise = require('promise');
var Qs = require('qs');

var crmService = require('./business_service/internal/crm_service.js');
var crmValidation = require('./business_service/validation/validation.js');

exports.getAgents = agentAPI.getAgents;
exports.getAgent = agentAPI.getAgent;
exports.createAgent = agentAPI.createAgent;
exports.updateAgent = agentAPI.updateAgent;
exports.removeAgent = agentAPI.removeAgent;

exports.getCustomers = customerAPI.getCustomers;
exports.getCustomer = customerAPI.getCustomer;
exports.createCustomer = customerAPI.createCustomer;
exports.updateCustomer = customerAPI.updateCustomer;
exports.removeCustomer = customerAPI.removeCustomer;

exports.getContactRecords = contactRecordAPI.getContactRecords;
exports.getContactRecord = contactRecordAPI.getContactRecord;
exports.createContactRecord = contactRecordAPI.createContactRecord;
exports.updateContactRecord = contactRecordAPI.updateContactRecord;
exports.removeContactRecord = contactRecordAPI.removeContactRecord;

exports.getProducts = productAPI.getProducts;
exports.getProduct = productAPI.getProduct;
exports.createProduct = productAPI.createProduct;
exports.updateProduct = productAPI.updateProduct;
exports.removeProduct = productAPI.removeProduct;
