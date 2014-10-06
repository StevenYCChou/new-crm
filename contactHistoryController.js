module.exports = new function () {
  return {
    create: function (req, res) {
      var url = require('url'),
          agentID = Number(url.parse(req.url, true).query.agentID),
          customerID = Number(url.parse(req.url, true).query.customerID);

      var contactHistory = {
        time : req.param('time'),
        data : req.param('data'),
        textSummary : req.param('textSummary'),
        model : req.param('model'),
        agent: agentID,
        customer: customerID,
      };

/*      ContactHistory.create(contactHistory).exec(function (err, contactHistory) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.redirect('/agent' + agentID + '/customer/' + customerID);
        }
      });*/
      db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['ContactHistory'].create(contactHistory, function(err){
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.redirect('/agent' + agentID + '/customer/' + customerID);
          }
        });
      });
    },

    showCreate: function (req, res) {
      res.view('contact_history/create');
    },

    retrieve: function (req, res) {
      var contactHistoryID = req.param(contactHistoryID);

/*      ContactHistory.find(contactHistoryID).exec(function (err, contactHistory) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.set('Content-Type', 'application/json');
          res.view('contact_history/retrieve', contactHistory);
        }
      });*/
      db.once('open' function callback() {
        console.log('Connected to MongoDB !');
	models['ContactHistory'].find({}).where('id').equals(contactHistoryID).exec(function(err, agent)
        {
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.set('Content-Type', 'application/json');
            res.view('contact_history/retrieve', contactHistory);
          }
        });
      });
    }
  };
};
