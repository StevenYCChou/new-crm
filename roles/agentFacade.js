var dataService = require('../dataService.js');

exports.showProfile = function (req, res) {
  var agentId = req.param('agentId');
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
};

exports.showCustomerByCustomerId = function (req, res) {
  var agentId = req.param('agentId');
  var customerId = req.param('customerId');
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
};

exports.showProfileUpdatePage = function (req, res) {
  var agentId = req.param('agentId');
  dataService.getAgentById(agentId, function(err, agent) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else if (agent == null) {
      res.status(400).send({ error: "Agent doesn't exist." });
    } else {
      res.render('agents/update', {agent: agent});
    }
  });
};

exports.updateProfile = function (req, res) {
  var agentId = req.param('agentId');
  var updateInfo = req.body;
  dataService.updateAgentById(agentId, updateInfo, function(err, agent) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.send({redirect: '/agent/'+agentId});
    }
  });
};

exports.showCustomerCreationPage = function (req, res) {
  var agentId = req.param('agentId');
  res.render('customers/agent_view/create', {
    agent: { id: agentId },
  });
};

exports.createCustomer = function (req, res) {
  var customer = {
    name : req.param('name'),
    email : req.param('email'),
    phone : req.param('phone'),
    agent : req.param('agentId')
  };

  dataService.addCustomer(customer, function (err) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.redirect('/agent/' + req.param('agentId'));
    }
  });
};

exports.showCustomerUpdatePage = function (req, res) {
  var customerId = req.param('customerId');
  var agentId = req.param('agentId');

  dataService.getCustomerById(customerId, function (err, customer) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.render('customers/agent_view/update', {
        customer: customer,
        customerId: customerId,
        agentId: agentId
      });
    }
  });
};

exports.updateCustomer = function (req, res) {
  var customerId = req.param('customerId');
  var agentId = req.param('agentId');
  var newCustomerInfo = req.body;

  dataService.updateCustomerById(customerId, newCustomerInfo, function(err, updatedCustomerInfo) {
    if (err) {
      res.status(500).send({ errpr: "Database Error."});
    } else if (updatedCustomerInfo == null) {
      res.status(404).send({ error: "Customer doesn't exist."});
    } else {
      res.send({ redirect: '/agent/'+agentId+'/customer/'+customerId });
    }
  });
};

exports.removeCustomerById = function (req, res) {
  var customerId = req.param('customerId');
  var agentId = req.param('agentId');

  dataService.deleteCustomerById(customerId, function(err) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.send({redirect: '/agent/'+agentId});
    }
  });
};

exports.showContactRecordCreationPage = function (req, res) {
  var agentId = req.param('agentId');
  var customerId = req.param('customerId');

  res.render('contact_history/create', {
    agentId: agentId,
    customerId: customerId
  });
};

exports.CreateContactRecord = function (req, res) {
  var newContactHistory = {
    time : req.param('time'),
    data : req.param('data'),
    textSummary : req.param('textSummary'),
    model : req.param('model'),
    agent: req.param('agentId'),
    customer: req.param('customerId'),
  };
  var agentId = req.param('agentId');
  var customerId = req.param('customerId');

  dataService.addContactHistory(newContactHistory, function(err, contactHistory) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.send({ redirect: '/agent/'+agentId+'/customer/'+customerId });
    }
  });
};

exports.getContactRecordById = function (req, res) {
  var contactHistoryId = req.param('contactHistoryId');
  dataService.getContactHistoryById(contactHistoryId, function (err, contactHistory) {
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
};

