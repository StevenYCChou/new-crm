var crmService = require('./crm_service.js');

exports.retrieveProfilePage = function(req, res) {
  res.render('customer/retrieve');
};

exports.showProfileUpdatePage = function (req, res) {
  var customerId = req.param('customerId');

  crmService.retrieveCustomerById(customerId, function (err, customer) {
    if (err) {
      res.status(500).send({ error: "Database Error." });
    } else {
      res.render('customer/update', {
        customer: customer
      });
    }
  });
};
