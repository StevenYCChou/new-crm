var crmService = require('./crm_service.js');

exports.retrieveProfilePage = function(req, res) {
  res.render('customer/retrieve');
};

exports.showProfileUpdatePage = function (req, res) {
  res.render('customer/update');
};
