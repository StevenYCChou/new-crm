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

function getCachedResponse(nonce, callback, res) {
  console.log(nonce);
  if (!nonce) {
    res.status(403).json({msg: "Modification request doesn't include nonce."});
  } else {
    mongodbService.Response.findOne({nonce: nonce}).exec().then(function (responseEntry){
      if (responseEntry === null) {
        console.log("[api.getCachedResponse] Response is not cached.");
        res.status(202).json({});
        mongodbService.Response.create({nonce: nonce}).then(function() {
          console.log("[api.getCachedResponse] process data");
          return callback();
        }).then(function(response) {
          console.log("[api.getCachedResponse] Update response cache with successful response");
          return mongodbService.Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: response}}).exec();
        }, function(error) {
          console.log("[api.getCachedResponse] Update response cache with failure response");
          return mongodbService.Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: error}}).exec();
        }).then(function() {
          console.log("[api.getCachedResponse] finish process.");
        }).else(function(err) {
          console.log(err);
        });
      } else if (responseEntry.status === "COMPLETED") {
        console.log("[api.getCachedResponse] Response is processed and cached.");
        res.status(200).json({response: responseEntry.response});
      } else {
        console.log("[api.getCachedResponse] Response is processed but not cached.");
        res.status(202).json({});
      }
    }, function(err) {
      console.log("[api.getCachedResponse] Error occurs");
    });
  }
}

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
