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
        agentId: req.param('agentID'),
        customerId: req.param('customerID'),
      };
      var agentID = req.param('agentID');
      var customerID = req.param('customerID');

      models['ContactHistory'].create(contactHistory, function (err, contactHistory) {  
        models['Agent'].findOneAndUpdate({_id: req.param('agentID')}, {$push: {ContactHistory: contactHistory["_id"]}}, {safe: true, upsert:true}, function(err, agent) {
          models['Customer'].findOneAndUpdate({_id: req.param('customerID')}, {$push: {ContactHistory: contactHistory["_id"]}}, {safe: true, upsert:true}, function(err, customer) {
            if (err) {
              res.status(500).send({ error: "Database Error." });
            } else {
              res.render('customers/agent_view/retrieve', {
                agent: agent,
                customer: customer,
                contact_history: contactHistory,
              });
            }
          });
        });
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
        models['Agent'].find({}).where('_id').equals(contact_history[0]["agentId"]).exec(function (err, agent) {
          models['Customer'].find({}).where('_id').equals(contact_history[0]["customerId"]).exec(function (err, customer) {
            if (err) {
              res.status(500).send({ error: "Database Error." });
            } else {
              res.render('contact_history/retrieve', {
                contact_history: contact_history[0],
                agent: agent[0],
                customer: customer[0],
              });
            }
          });
        });
      });
    },
  };
};
