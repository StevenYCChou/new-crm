var crmService = require('./crm_service.js');

exports.retrieveProfilePageAPI = function (req, res) {
  var customerId = req.param('customerId');
  crmService.retrieveCustomerById(customerId, function(err, customer) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      crmService.retrieveContactHistoryByCustomerId(customerId, function(err, contactHistory) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.json({
            customer: customer,
            agent: customer.agent,
            contact_history: contactHistory
          });
        }
      });
    }
  });
};

exports.retrieveProfilePage = function(req, res) {
  res.render('customers/customer_view/retrieve');
};
exports.showProfileUpdatePage = function (req, res) {
  var customerId = req.param('customerId');

  crmService.retrieveCustomerById(customerId, function (err, customer) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.render('customers/customer_view/update', {
        customer: customer
      });
    }
  });
};

exports.updateProfileAPI = function (req, res) {
  var customerId = req.param('customerId');
  var newCustomerInfo = {name: req.param('name'), phone: req.param('phone'), email: req.param('email')};
  crmService.updateCustomerById(customerId, newCustomerInfo, function(err, updatedCustomerInfo) {
    if (err) {
      res.status(500).send({ errpr: "Database Error."});
    } else if (updatedCustomerInfo == null) {
      res.status(404).send({ error: "Customer doesn't exist."});
    } else {
      res.json({data: 'success'});
    }
  });
};
