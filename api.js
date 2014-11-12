var mongodbService = require('./data_service/mongodb_service.js');
var Promise = require('promise');

exports.getAgents = function (req, res) {
  var fulfill = function(agents) {
    res.json(agents);
  }
  var reject = function(err) {
    res.json({error: err});
  }

  var name_q = new RegExp(req.param('name'));
  var is_all = (req.param('all')) ? true : false;
  var page_no =(req.param('p')) ? req.param('p') : 1;
  var per_page = (req.param('per_page')) ? req.param('per_page') : 10;

  var getAllAgentsPromise = function() {
      return new Promise(function(fulfill, reject) {
        mongodbService.Agent.find({}).exec(function(err, agents) {
        if (err) reject(err);
        else fulfill(agents);
      });
    });
  };

  var getAgentsPromise = function(name_q, page_no, per_page) {
      return new Promise(function(fulfill, reject) {
        mongodbService.Agent.find({name: name_q}, {_id: 0, __v: 0})
                            .skip((page_no - 1) * per_page)
                            .limit(per_page).exec(function(err, agents) {
        if (err) reject(err);
        else fulfill(agents);
      });
    });
  };

  if (is_all) {
    getAllAgentsPromise().done(fulfill, reject);
  } else {
    getAgentsPromise(name_q, page_no, per_page).done(fulfill, reject);
  }
};