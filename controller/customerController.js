var mongoose = require('mongoose');
var models = require('../model.js');
var db = require('../db.js');

module.exports = new function () {
  return {
    create: function (req, res) {
      var customer = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
        agent : Number(req.param('agentID')),  // int
      };

      console.log('Connected to MongoDB!');
      models['Customer'].create(customer, function(err, customer){
        if (err) { 
	  res.send(500, { error: "Database Error."});
        } else {
          res.redirect('/agent' + customer.id);
        }
      });    
    },

    showCreate: function (req, res) {
      res.view('customers/agent_view/create');
    },

    retrieve: function (req, res) {
      var customerID = req.param('customerID');

      cosole.log('Connected to MongoDB');
  models['Customer'].find({}).where('_id').equals(customerID).exec(function(err, customer) {
        if (err) {
          res.send(500, {error: "Database Error."});
        } else { 
	  res.set('Content-Type', 'application/json');
          res.render('customers/customer_view/retrieve', customer);
        }
      });
    },

    // This function is shared by agent and customer to update the customer info.
    update: function (req, res) {
      var customerID = req.param('customer');

      console.log('Connected to MongoDB !');
      models['Customer'].findOneAndUpdate({_id: customerID}, {name: req.body['name'], phone: req.body['phone'], email: req.body['email']}, function (err, customer) {
        if (err) {
          res.send(404, { error: "Customer doesn't exist." });
        } else {
            // TODO(wenjun): Verify that redirect to correct page (GET method).
          res.redirect(req.url);
        }
      });
    },

    showUpdatePage: function (req, res) {
      var customerID = req.param('customerID');

      cosole.log('Connected to MongoDB');
      models['Customer'].find({}).where('_id').equals(customerID).exec(function(err, customer) { 
	if (err) {
          res.send(500, {error: "Database Error."});
        } else {
          res.render('customers/customer_view/update', customer);
        }
      });
    },

    delete: function (req, res) {
      var customerID = req.param('customerID')

      console.log('Connected to MongoDB !');
      models['Customer'].find({}).where('_id').equals(customerID).remove().exec(function(err, customer) {
        if (err) {
          res.send(404, { error: "Customer doesn't exist." });
        } else {
            // Back to the previous page.
          res.redirect('/agent' + req.param('agentID'));
        }
      });
    }
  };
};
