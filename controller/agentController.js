var dataService = require('../dataService.js');

module.exports = new function () {
  return {
    create: function (req, res) {
      var agent = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
      };

      dataService.addAgent(agent, function(err) {
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
      dataService.getAllAgents(function(err, agents){
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
      var agentId = req.param('agentid');
      dataService.getAgentById(agentId, function(err, agent) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          dataService.getCustomersByAgentId(agentId, function(err, customers) {
            if (err) {
              res.status(500).send({ error: "Database Error." });
            } else {
              var data = {
                agent: agent,
                customers: customers
              };
              res.render('agents/retrieve', data);
            }
          });
        }
      });
    },

    showCustomer: function (req, res) {
      var agentId = req.param('agentid');
      var customerId = req.param('customerid');
      dataService.getCustomerById(customerId, function(err, customer) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else if (customer == null) {
          res.status(400).send({ error: "Customer doesn't exist."});
        } else {
          dataService.getContactHistoryByAgentIdAndCustomerId(agentId, customerId, function(err, contactHistory) {
            var data = {
              agent: customer.agent,
              customer: customer,
              contact_history: contactHistory
            };
            res.render('customers/agent_view/retrieve', data);
          });
        }
      });
    },

    update: function (req, res) {
      var agentId = req.param('agentid');
      var updateInfo = req.body;
      dataService.updateAgentById(agentId, updateInfo, function(err, agent) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.send({redirect: '/agent/'+agentId});
        }
      });
    },

    showUpdatePage: function (req, res) {
      var agentId = req.param('agentid');
      dataService.getAgentById(agentId, function(err, agent) {
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
