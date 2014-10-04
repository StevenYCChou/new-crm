module.exports = new function () {
  return {
    create: function (req, res) {
      var customer = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
        agent : Number(req.param('agentID')),  // int
      };

      Customer.create(customer).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.redirect('/agent' + customer.customerID);
        }
      });
    },

    showCreate: function (req, res) {
      res.view('customers/agent_view/create');
    },

    retrieve: function (req, res) {
      var customerID = req.param('customerID');

      Customer.find(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.set('Content-Type', 'application/json');
          res.view('customers/customer_view/retrieve', customer);
        }
      });
    },

    // This function is shared by agent and customer to update the customer info.
    update: function (req, res) {
      var customerID = req.param('customer');

      Customer.update(customerID, req.body).exec(function (err, customer) {
        if (err) {
          res.send(404, { error: "Customer doesn't exist." });
        } else {
          // TODO(wenjun): Verify that redirect to correct page (GET method).
          res.redirect(req.url)
        }
      });
    },

    showUpdatePage: function (req, res) {
      var customerID = req.param('customerID');

      Customer.find(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('customers/customer_view/update', customer);
        }
      });
    },

    delete: function (req, res) {
      var customerID = req.param('customerID')

      Customer.destory(customerID).exec(function (err, customer) {
        if (err) {
          res.send(404, { error: "Customer doesn't exist." });
        } else {
          // Back to the previous page.
          res.redirect('/agent' + req.param('agetnID'));
        }
      })
    }
  };
};