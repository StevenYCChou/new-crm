/* Validation.js makes rules for 'CRUD' operations before accessing the
 * database. If the rule is violated, an Error object will be passed to the
 * callback function as the first argument, and the callback can handle the
 * error on its behalf.
 *
 * Example:
 *  var crmValidation = require('./validation.js'); // File path
 *  crmValidation.createCustomerValidation(id, function (err, data) {
 *    if (err) handleError(err);
 *    // Create customer.
 *  })
 */


var mongodbService = require('../../data_service/mongodb_service.js');
var crmService = require('../internal/crm_service.js');
var Agent = mongodbService.Agent;
var Customer = mongodbService.Customer;
var ContactRecord = mongodbService.ContactRecord;

var AGENT_MAX_CUSTOMER = 5;
var CUSTOMER_UPDATE_AGENT_RECORD_DURATION = 60*60*24*3*1000; // 72 hours
var CREATE_CUSTOMR_AGENT_BLACKLIST = ["TX", "NY"];
var UPDATE_CUSTOMER_CONTACT_AGENT_WHITELIST = ["MN", "CT"];

exports.createCustomerValidation = function (agentId, callback) {
  Agent.findById(agentId, function (err, agent) {
    if (err) {
      callback(err);
    } else {
      if (CREATE_CUSTOMR_AGENT_BLACKLIST.indexOf(agent.location) == -1) {
        callback(null);
      } else {
        Customer.where('agent').equals(agentId).count(function (err, count) {
          if (err) {
            callback(err);
          }
          else if (count >= MAX_CUSTOMER) {
            callback(new Error('Unable to create customer.'));
          } else {
            callback(null);
          }
        });
      }
    }
  });
};

exports.updateCustomerContactValidation = function (customerId, callback) {
  Customer.findById(customerId).populate('agent').exec(function (err, customer) {
    if (err) {
      callback(err);
    } else {
      if (UPDATE_CUSTOMER_CONTACT_AGENT_WHITELIST.indexOf(customer.agent.location) != -1) {
        callback(null);
      } else {
        // Get most recent Sunday.
        var currTime = new Date();
        var today = new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate());
        var mostRecentSunday = new Date(today.setDate(today.getDate() - today.getDay()));

        if (customer.lastUpdated - mostRecentSunday < 0) {
          callback(null);
        } else {
          callback(new Error('Unable to update customer profile.'));
        }
      }
    }
  });
};

exports.updateCustomerAgentValidation = function (customerId, callback) {
  ContactRecord.where('customer').equals(customerId).sort({time: -1}).limit(1).exec(function (err, contactRecords) {
    if (err) {
      callback(err);
    } else {
      if (contactRecords.length < 1) {
        callback(null);
      } else {
        var currTime = new Date();
        if (contactRecords[0].time - currTime > CUSTOMER_UPDATE_AGENT_RECORD_DURATION) {
          callback(null);
        } else {
          callback(new Error('Unable to assign new agent to the customer'));
        }
      }
    }
  });
};

