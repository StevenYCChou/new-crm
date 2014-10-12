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
      models['Agent'].find({}).where('_id').equals(agentID).exec(function(err, agent)
      {
        models['Customer'].find({'_id': { $in: agent[0]["customers"]}}, function(err, customers)
        {
          if (err){
             res.send(500, { error: "Database Error." });
          } else {
  	          res.render('agents/retrieve', {
              agent: agent[0],
              customers: customers
            });
          }
        });
      });
    },

    // Same with `retrieve`.
    showCustomer: function (req, res) {
      var agentID = req.param('agentID');
      var customerID = req.param('customerID');

      models['Agent'].find({}).where('_id').equals(agentID).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          models['Customer'].find({}).where('_id').equals(customerID).exec(function(err, customers){
            models['ContactHistory'].find({'_id': { $in: customers[0]["ContactHistory"]}}, function(err, contact_history) {
              res.render('customers/agent_view/retrieve', {
                agent: agent[0],
                customer: customers[0],
                contact_history: contact_history,
              });
            });
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
