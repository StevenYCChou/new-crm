var mongoose = require('mongoose');
var models = require('./model.js');

module.exports = new function () {
  console.log('Try to connect to MongoDB via Mongoose ...');
  mongoose.connect('mongodb://localhost/27017');
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'Mongoose connection error:'));
  
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

    getAll: function (req, res) {
    /*      Agent.find().exec(function (err, agents) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          // TODO: Do you guys have some suggestions to improve this
          // method. I did not use 'delete agent.[key]' here, cause I think the
          // code is hard to maintain if we add other attributes to the model
          // later. But current method take up more space.
          filtered_agents = [];
          agents.forEach(function (agent) {
            filtered_agents.push({
             name: agent.name,
             phone: agent.phone,
             email: agent.email,
             id: agent.id,
            });
          });
          res.view('agents/index', {
            agents: filtered_agents,
          });
        }
      });*/
      db.once('open', function callback() {
        console.log('Connected to MongoDB !');
        models['Agent'].find({}).exec(function(err, agent)
        {
          if (err){
            res.send(500, { error: "Database Error." });
          } else {
            res.view('agents/index', {
              agents: {name: agent.name, phone: agent.phone, email: agent.email, id: agent.id},
            });
          }
        });
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
            res.view('agents/retrieve', {
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
            res.view('customers/agent_view/retrieve', {
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
            res.view('agents/update', agent);
          }
        });
      });     
    }
  };
};
