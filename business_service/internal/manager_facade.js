var crmService = require('./crm_service.js');

exports.showAllAgents = function(req, res) {
  res.render('manager/agent/index');
};

exports.showAgentCreationPage = function (req, res) {
  res.render('manager/agent/create');
};
