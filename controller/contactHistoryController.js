var dataService = require('../dataService.js');

module.exports = new function () {
  return {
    create: function (req, res) {
      var newContactHistory = {
        time : req.param('time'),
        data : req.param('data'),
        textSummary : req.param('textSummary'),
        model : req.param('model'),
        agent: req.param('agentid'),
        customer: req.param('customerid'),
      };
      var agentId = req.param('agentid');
      var customerId = req.param('customerid');

      dataService.addContactHistory(newContactHistory, function(err, contactHistory) {
        if (err) {
          res.status(500).send({ error: "Database Error." });
        } else {
          res.redirect('/agent/'+agentId+'/customer/'+customerId);
        }
      });
    },

    showCreate: function (req, res) {
      var agentId = req.param('agentid');
      var customerId = req.param('customerid');

      res.render('contact_history/create',{
        agentId: agentId,
        customerId: customerId
      });
    },

    retrieve: function (req, res) {
      var contactHistoryId = req.param('contactHistoryid');
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
    }
  };
};
