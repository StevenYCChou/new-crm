var mongoose = require('mongoose');
var models = require('../model.js');
var Agent = require('../model.js').Agent;
var crm_service = require('../crm_service.js');

module.exports = new function () {
  return {
    create: function (req, res) {
      var agent = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
      };

      crm_service.addAgent(agent, function(err) {
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
      crm_service.getAllAgents(function(err, agents){
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
            agents: filtered_agents
          });
        }
      });
    },

    retrieve: function (req, res) {
      var agentID = req.param('agentID');
      crm_service.getAgentById(agentID, function(err, agent) {
        if (err){
          res.status(500).send({ error: "Database Error." });
        } else {
          var data = {
            agent: agent,
            customers: agent.customers
          };
          res.render('agents/retrieve', data);
        }
      });
    },

    // Same with `retrieve`.
    showCustomer: function (req, res) {
      var agentId = req.param('agentID');
      var customerId = req.param('customerID');
      crm_service.getCustomerById(customerId, function(err, customer) {
        res.render('customers/agent_view/retrieve', {
          agent: customer.agent,
          customer: customer,
          contact_history: customer.contactHistory
        });
      });
    },

    update: function (req, res) {
      var agentId = req.param('agentID');
      var updateInfo = req.body;
      crm_service.updateAgentById(agentId, updateInfo, function(err, agent) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.render('agents/retrieve', {
            agent: agent,
            customers: agent.customers,
          });
        }
      });
    },

    showUpdatePage: function (req, res) {
      var agentId = req.param('agentID');
      crm_service.getAgentById(agentId, function(err, agent) {
	      if (err) {
          res.status(500).send({ error: "Database Error." });
        } else if (agent == null) {
          res.status(400).send({ error: "Agent doesn't exist." });
        } else {
          res.render('agents/update', {agent: agent});
        }
      });
    }
  };
};
