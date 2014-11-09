var crmService = require('./crm_service.js');

exports.showAllAgentsAPI = function (req, res) {
  crmService.retrieveAllAgents(function(err, agents){
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
      res.json(filtered_agents.slice(0));
    }
  });
};

exports.showAllAgents = function(req, res) {
  res.render('agents/index');
};

exports.showAgentCreationPage = function (req, res) {
  res.render('agents/create');
};

exports.createNewAgentAPI = function (req, res) {
  var agent = {
    name : req.param('name'),
    email : req.param('email'),
    phone : req.param('phone'),
  };

  crmService.createAgent(agent, function(err) {
    if (err) {
      res.send(500, { error: "Database Error." });
    }
  });
};
