var crm_service = require('../crm_service.js');

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
        agent : req.param('agentID')
      };

      crm_service.addCustomer(customer, function (err) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.redirect('/agent/' + req.param('agentID'));
        }
      });
    },

    retrieve: function (req, res) {
      var customerId = req.param('customerID');
      crm_service.getCustomerById(customerId, function(err, customer) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          crm_service.getContactHistoryByCustomerId(customerId, function(err, contactHistory) {
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
      var customerId = req.param('customerID');
      var newCustomerInfo = req.body;
      crm_service.updateCustomerById(customerId, newCustomerInfo, function(err, updatedCustomerInfo) {
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
      var customerId = req.param('customerID');
      var agentId = req.param('agentID');
      var newCustomerInfo = req.body;

      crm_service.updateCustomerById(customerId, newCustomerInfo, function(err, updatedCustomerInfo) {
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
      var customerId = req.param('customerID');

      crm_service.getCustomerById(customerId, function (err, customer) {
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
      var customerId = req.param('customerID');
      var agentId = req.param('agentID');

      crm_service.getCustomerById(customerId, function (err, customer) {
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
      var customerId = req.param('customerID');
      var agentId = req.param('agentID');

      crm_service.deleteCustomerById(customerId, function(err) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.send({redirect: '/agent/'+agentId});
        }
      });
    }
  };
};
