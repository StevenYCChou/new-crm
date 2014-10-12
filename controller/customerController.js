var mongoose = require('mongoose');
var models = require('../model.js');
var db = require('../db.js');

module.exports = new function () {
  return {
    showCreate: function (req, res) {
      var agentID = req.param('agentID');

      res.render('customers/agent_view/create', {
        agent: { id: agentID },
        });
    },

    createViaAgent: function (req, res) {
      var customer = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
        agent : req.param('agentID'),  
      };

      models['Customer'].create(customer, function (err, customer) {
        models['Agent'].findOneAndUpdate({_id: req.param('agentID')}, {$push: {customers: customer["_id"]}}, {safe: true, upsert:true}, function(err, agent) {
          if (err) {
            res.status(500).send({ error: "Database Error." });
          } else {
            res.redirect('/agent/' + req.param('agentID'));
          }
        });
      });
    },
    retrieve: function (req, res) {
      var customerID = req.param('customerID');
      models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
        models['Agent'].find({}).where('_id').equals(customer[0]["agent"]).exec(function (err, agent) {
          models['ContactHistory'].find({'_id': { $in: customer[0]["ContactHistory"]}},function (err, contactHistory) {
            if (err) {
              res.status(500).send({ error: "Database Error." });
            } else {
              res.render('customers/customer_view/retrieve', {
                customer: customer[0],
                agent: agent[0],
                contact_history: contactHistory,
              });
            }
          });
        });
      });
    },

    updateViaCustomer: function (req, res) {
      var customerID = req.param('customerID');
      models['Customer'].findOneAndUpdate({_id: customerID}, req.body).exec(function (err, customer) {
        if (err) {
          res.status(404).send({ error: "Customer doesn't exist." });
        } else {
          models['Agent'].find({}).where('_id').equals(customer["agent"]).exec(function (err, agent) {
            models['ContactHistory'].find({'_id': { $in: customer["ContactHistory"]}},function (err, contactHistory) {
              if (err) {
                res.status(500).send({ error: "Database Error." });
              } else {
                res.render('customers/customer_view/retrieve', {
                  customer: customer,
                  agent: agent[0],
                  contact_history: contactHistory,
                });
              }
            });
          });
        }
      });
    },

    updateViaAgent: function (req, res) {
      var customerID = req.param('customerID');
      var agentID = req.param('agentID');
      models['Customer'].findOneAndUpdate({_id: customerID}, req.body).exec(function (err, customer) {
        if (err) {
          res.status(404).send({ error: "Customer doesn't exist." });
        } else {
          models['Agent'].find({}).where('_id').equals(agentID).exec(function (err, agent) {
            models['ContactHistory'].find({'_id': { $in: customer["ContactHistory"]}}, function (err, contact_history) {
              if (err) {
                res.status(500).send({ error: "Database Error." });
              } else {
                res.render('customers/agent_view/retrieve', {
                  agent: agent,
                  customer: customer,
                  contact_history: contact_history,
                });
              }
            });
          });
        }
      });
    },

    showUpdatePageViaCustomer: function (req, res) {
      var customerID = req.param('customerID');

      models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.render('customers/customer_view/update', {
            customer: customer[0],
          });
        }
      });
    },

    showUpdatePageViaAgent: function (req, res) {
      var customerID = req.param('customerID');
      var agentID = req.param('agentID');

      models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.render('customers/agent_view/update', {
            customer: customer[0],
            agent: {id: agentID},
          });
        }
      });
    },

    delete: function (req, res) {
      var customerID = req.param('customerID');
      var agentID = req.param('agentID');

      models['Customer'].find({}).where('_id').equals(customerID).remove().exec(function (err) {
        if (err) {
          res.status(404).send({ error: "Customer doesn't exist." });
        } else {
          models['Agent'].find({}).where('_id').equals(agentID).exec(function (err, agent) {
            if (err) {
              res.status(500).send({ error: "Database Error." });
            } else {
              res.render('agents/retrieve', {
                agent: agent,
                customers: agent[0]["customers"],
              });
            }
          });
        }
      });
    },
  };
};
