var mongoose = require('mongoose');
var models = require('../model.js');
var Agent = require('../model.js').Agent;

module.exports = new function () {
  return {
    create: function (req, res) {
      var agent = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
      };

      models['Agent'].create(agent, function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.redirect('/agents');
        }
      });
    },

    showCreatePage: function (req, res) {
      res.render('agents/create');
    },

    getAll: function (req, res) {
      models['Agent'].find({}).exec(function(err, agents)
      {
        if (err){
          res.send(500, { error: "Database Error." });
        } else {
          filtered_agents = [];
          agents.forEach(function (agent) {
            filtered_agents.push({
              name: agent.name,
              phone: agent.phone,
              email: agent.email,
              id: agent.id,
            });
          });
          res.render('agents/index', {
            agents: filtered_agents,
          });
        }
      });
    },

    // I do not delete '[ContactHistory, customer.ContactHistory]' here. I do not
    // want the function be too specific.
    retrieve: function (req, res) {
      var agentID = req.param('agentID');

      console.log('Connected to MongoDB !');
      models['Agent'].find({}).where('_id').equals(agentID).exec(function(err, agent)
      {
        if (err){
           res.send(500, { error: "Database Error." });
        } else {
	          res.render('agents/retrieve', {
            agent: agent[0],
            customers: agent[0]["customers"]
          });
        }
      });
    },

    // Same with `retrieve`.
    showCustomer: function (req, res) {
      var agentID = Number(req.param('agentID'));
      var customerID = Number(req.param('customerID'));

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
    },

    update: function (req, res) {
      var agentID = req.param('agentID');

      models['Agent'].findOneAndUpdate({_id: agentID}, req.body).exec(function (err, agent) {
        if (err) {
          res.send(404, { error: "Agent doesn't exist." });
        } else {

          models['Agent'].find({}).where('_id').equals(agentID).exec(function (err, agent) {
            if (err) {
              res.send(500, { error: "Database Error." });
            } else {
              res.render('agents/retrieve', {
                agent: agent[0],
                customers: agent[0].customers,
              });
            }
          });
        }
      });
    },

    showUpdatePage: function (req, res) {
      var agentID = req.param('agentID');

      console.log('Connected to MongoDB !');
      models['Agent'].find({}).where('_id').equals(agentID).exec(function(err, agents)
      {
	      if (err){
          res.send(500, { error: "Database Error." });
        } else {
          res.render('agents/update', {agent: agents[0]});
        }
      });
    }
  };
};
