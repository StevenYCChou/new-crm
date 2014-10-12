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
      console.log(customer);

      models['Customer'].create(customer, function (err, customer) {
        models['Agent'].findOneAndUpdate({_id: req.param('agentID')}, {$push: {customers: customer["_id"]}}, {safe: true, upsert:true}, function(err, agent) {
          console.log(agent);
          if (err) {
            res.send(500, { error: "Database Error." });
          } else {
            res.redirect('/agent/' + req.param('agentID'));
          }
        });
      });
    },
    retrieve: function (req, res) {
      var customerID = req.param('customerID');

      models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.render('customers/customer_view/retrieve', {
            customer: customer,
            agent: customer.agent,
            contact_history: customer.contactHistory,
          });
        }
      });
    },

    updateViaCustomer: function (req, res) {
      var customerID = req.param('customerID');
      models['Customer'].findOneAndUpdate({_id: customerID}, req.body).exec(function (err, customer) {
        if (err) {
          res.send(404, { error: "Customer doesn't exist." });
        } else {
          models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
            if (err) {
              res.send(500, { error: "Database Error." });
            } else {
              res.view('customers/customer_view/retrieve', {
                customer: customer,
                agent: customer.agent,
                contact_history: customer.contactHistory,
              });
            }
          });
        }
      });
    },

    updateViaAgent: function (req, res) {
      var customerID = req.param('customerID');
      var agentID = req.param('agentID');
      console.log("update customers");
      models['Customer'].findOneAndUpdate({_id: customerID}, req.body).exec(function (err, customer) {
        if (err) {
          res.send(404, { error: "Customer doesn't exist." });
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

     showUpdatePageViaCustomer: function (req, res) {
      var customerID = req.param('customerID');

      models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.render('customers/customer_view/update', {
            customer: customer,
          });
        }
      });
    },

    showUpdatePageViaAgent: function (req, res) {
      var customerID = req.param('customerID');
      var agentID = req.param('agentID');

      models['Customer'].find({}).where('_id').equals(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
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
          res.send(404, { error: "Customer doesn't exist." });
        } else {
          models['Agent'].find({}).where('_id').equals(agentID).exec(function (err, agent) {
            if (err) {
              res.send(500, { error: "Database Error." });
            } else {
              res.render('agents/retrieve', {
                agent: agent,
                customer: agent.customers,
              });
            }
          });
        }
      });
    },
  };
};
