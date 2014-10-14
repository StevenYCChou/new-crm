var mongoose = require('mongoose');
var models = require('../model.js');
var db = require('../db.js');
var crm_service = require('../crm_service.js');

module.exports = new function () {
  return {
    create: function (req, res) {
      var newContactHistory = {
        time : req.param('time'),
        data : req.param('data'),
        textSummary : req.param('textSummary'),
        model : req.param('model'),
        agent: req.param('agentID'),
        customer: req.param('customerID'),
      };
      var agentId = req.param('agentID');
      var customerId = req.param('customerID');

      crm_service.addContactHistory(newContactHistory, function(err, contactHistory) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.redirect('/agent/'+agentId+'/customer/'+customerId);
        }
      });
    },

    showCreate: function (req, res) {
      var agentId = req.param('agentID');
      var customerId = req.param('customerID');

      res.render('contact_history/create',{
        agentId: agentId,
        customerId: customerId
      });
    },

    retrieve: function (req, res) {
      var contactHistoryId = req.param('contactHistoryID');
      crm_service.getContactHistoryById(contactHistoryId, function (err, contactHistory) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.render('contact_history/retrieve', {
            contact_history: contactHistory,
            agentId: contactHistory['agent'],
            customerId: contactHistory['customer']
          });
        }
      });
    }
  };
};
