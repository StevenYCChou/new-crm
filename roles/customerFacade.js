var dataService = require('../dataService.js');

exports.getProfilePage = function (req, res) {
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
};

exports.showProfileUpdatePage = function (req, res) {
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
};

exports.updateProfile = function (req, res) {
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