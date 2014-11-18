var crmService = require('./crm_service.js');

exports.showProfile = function (req, res) {
  res.render('agent/retrieve');
}

exports.showCustomerDetailPage = function (req, res) {
  res.render('agent/customer/retrieve');
}

exports.showProfileUpdatePage = function (req, res) {
  res.render('agent/update');
};

exports.showCustomerCreationPage = function (req, res) {
  res.render('agent/customer/create');
};

exports.showCustomerUpdatePage = function (req, res) {
  res.render('agent/customer/update');
};

exports.showContactRecordCreationPage = function (req, res) {
  var agentId = req.param('agentId');
  var customerId = req.param('customerId');

  res.render('agent/contact_record/create', {
    agentId: agentId,
    customerId: customerId
  });
};

exports.retrieveContactRecordById = function (req, res) {
  res.render('agent/contact_record/retrieve');
}
