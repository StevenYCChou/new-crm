var dataService = require('../data_service/crm_data_service.js');

exports.showAllAgents = function (req, res) {
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
};

exports.showAgentCreationPage = function (req, res) {
  res.render('agents/create');
};

exports.createNewAgent = function (req, res) {
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
};
