var mongoose = require('mongoose');
var models = require('../model.js');
var db = require('../db.js');

module.exports = new function () {
  return {
    create: function (req, res) {
      var contactHistory = {
        time : req.param('time'),
        data : req.param('data'),
        textSummary : req.param('textSummary'),
        model : req.param('model'),
        agent: req.param('agentID'),
        customer: req.param('customerID'),
      };
      var agentID = req.param('agentID');
      var customerID = req.param('customerID');
     
      models['ContactHistory'].create(contactHistory, function (err, contactHistory) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          models['Agent'].find({}).where('_id').equals(agentID).exec(function (err, agent) {
            if (err) {
              res.send(500, { error: "Database Error." });
            } else {
              var customer;
              agent.customers.forEach(function (customer_res) {
                if (customer_res.id == customerID) {
                  customer = customer_res;
                }
              })
              var contact_history = []
              agent.contactHistory.forEach(function (contact_history_res) {
                if (contact_history_res.customer == customerID) {
                  contact_history.push(contact_history_res);
                }
              })
              res.render('customers/agent_view/retrieve', {
                agent: agent,
                customer: customer,
                contact_history: contact_history,
              });
            }
          });
        }
      });
    },

    showCreate: function (req, res) {
      var url = require('url')
      var agentID = url.parse(req.url, true).query.agentID
      var customerID = url.parse(req.url, true).query.customerID

      res.render('contact_history/create',{
        agent: { id: agentID },
        customer: { id: customerID },
      });
    },

    retrieve: function (req, res) {
      var contactHistoryID = req.param('contactHistoryID');

      models['ContactHistory'].find({}).where('_id').equals(contactHistoryID).exec(function (err, contact_history) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.render('contact_history/retrieve', {
            contact_history: contact_history,
            agent: contact_history.agent,
            customer: contact_history.customer,
          });
        }
      });
    },
  };
};
