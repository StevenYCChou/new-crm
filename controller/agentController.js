var mongoose = require('mongoose');
var models = require('../model.js');
var Agent = require('../model.js').Agent;

module.exports = new function () {
  return {
    create: function (req, res) {
      var agent = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
      };

    
/*      Agent.create(agent).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.redirect('/agents');
        }
      });*/
      db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['Agent'].create(agent, function(err){
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.redirect('/agents');
          }
        }); 
      });
    },

    showCreatePage: function (req, res) {
      res.render('agents/create');
    },

    getAll: function (req, res) {
      models['Agent'].find({}).exec(function(err, agents)
      {
        if (err){
          res.send(500, { error: "Database Error." });
        } else {
          filtered_agents = [];
          agents.forEach(function (agent) {
            filtered_agents.push({
              name: agent.name,
              phone: agent.phone,
              email: agent.email,
              id: agent.id,
            });
          });
          res.render('agents/index', {
            agents: filtered_agents,
          });
        }
      });
    },

    // I do not delete '[ContactHistory, customer.ContactHistory]' here. I do not
    // want the function be too specific.
    retrieve: function (req, res) {
     var agentID = req.param('agentID');

 /*      Agent.find(agentID).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('agents/retrieve', {
            agent: agent[0],
            customer: agent[0].customers,
          });
        }
      });*/
      db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['Agent'].find({}).where('id').equals(agentID).exec(function(err, agent)
        {
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.render('agents/retrieve', {
              agent: agent[0],
              customer: agent[0].customers,
            });
          }
        });
      });

    },

    // Same with `retrieve`.
    showCustomer: function (req, res) {
      var agentID = req.param('agentID');
      var customerID = req.param('customerID');

/*      Agent.find(agentID).populate(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('customers/agent_view/retrieve', {
              customer: customer,
          });
        }
      });*/
      db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['Agent'].find({}).where('id').equals(agentID).customers.find({}).where('customerId').equals(customerID).exec(function(err, customer)
        {
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.render('customers/agent_view/retrieve', {
              customer: customer,
            });
          }
        });
      });
    },

    update: function (req, res) {
      var agentID = req.param('agent');

/*      Agent.update(agentID, req.body).exec(function (err, agent) {
        if (err) {
          res.send(404, { error: "Agent doesn't exist." });
        } else {
          // TODO(wenjun): Verify that redirect to correct page (GET method).
          res.redirect(req.url);
        }
      });*/
      
      db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['Agent'].findOneAndUpdate({id: agentID}, {name: req.body['name'], phone: req.body['phone'], email: req.body['email']}, function (err, agent) {
          if (err) {
            res.send(404, { error: "Agent doesn't exist." });
          } else {
            // TODO(wenjun): Verify that redirect to correct page (GET method).
            res.redirect(req.url);
          }
        });
      });
    },

    showUpdatePage: function (req, res) {
      var agentID = req.param('agentID');

/*      Agent.find(agentID).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('agents/update', agent);
        }
      });*/
       db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['Agent'].find({}).where('id').equals(agentID).exec(function(err, agent)
        {
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.render('agents/update', agent);
          }
        });
      });     
    }
  };
};
