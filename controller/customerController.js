var dataService = require('../dataService.js');

module.exports = new function () {
  return {
    showCreate: function (req, res) {
      var agentId = req.param('agentId');
      res.render('customers/agent_view/create', {
        agent: { id: agentId },
      });
    },

    createViaAgent: function (req, res) {
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
    },

    retrieve: function (req, res) {
      var customerId = req.param('customerId');
      dataService.getCustomerById(customerId, function(err, customer) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          dataService.getContactHistoryByCustomerId(customerId, function(err, contactHistory) {
            if (err) {
              res.status(500).send({ error: "Database Error." });
            } else {
              res.render('customers/customer_view/retrieve', {
                customer: customer,
                agent: customer.agent,
                contact_history: contactHistory
              });
            }
          });
        }
      });
    },

    updateViaCustomer: function (req, res) {
      var customerId = req.param('customerId');
      var newCustomerInfo = req.body;
      dataService.updateCustomerById(customerId, newCustomerInfo, function(err, updatedCustomerInfo) {
        if (err) {
          res.status(500).send({ errpr: "Database Error."});
        } else if (updatedCustomerInfo == null) {
          res.status(404).send({ error: "Customer doesn't exist."});
        } else {
          res.send({ redirect : '/customer/'+customerId });
        }
      });
    },

    updateViaAgent: function (req, res) {
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
    },

    showUpdatePageViaCustomer: function (req, res) {
      var customerId = req.param('customerId');

      dataService.getCustomerById(customerId, function (err, customer) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.render('customers/customer_view/update', {
            customer: customer
          });
        }
      });
    },

    showUpdatePageViaAgent: function (req, res) {
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
    },

    delete: function (req, res) {
      var customerId = req.param('customerId');
      var agentId = req.param('agentId');

      dataService.deleteCustomerById(customerId, function(err) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.send({redirect: '/agent/'+agentId});
        }
      });
    }
  };
};
