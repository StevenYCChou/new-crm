module.exports = new function () {
  return {
    create: function (req, res) {
      var agent = {
        name : req.param('name'),
        email : req.param('email'),
        phone : req.param('phone'),
      };

      Agent.create(agent).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.redirect('/agents');
        }
      });
    },

    showCreatePage: function (req, res) {
      res.render('agents/create');
    },

    getAll: function (req, res) {
      Agent.find().exec(function (err, agents) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          // TODO: Do you guys have some suggestions to improve this
          // method. I did not use 'delete agent.[key]' here, cause I think the
          // code is hard to maintain if we add other attributes to the model
          // later. But current method take up more space.
          data = {agents: []};
          agents.forEach(function (agent) {
            data.agents.push({
             name: agent.name,
             phone: agent.phone,
             email: agent.email,
             id: agent.id,
            });
          });
          res.render('agents/index', data);
        }
      });
    },

    // I do not delete '[ContactHistory, customer.ContactHistory]' here. I do not
    // want the function be too specific.
    retrieve: function (req, res) {
      var agentID = req.param('agentID');

      Agent.find(agentID).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('agents/retrieve', {
            agent: agent[0],
            customer: agent[0].customers,
          });
        }
      });
    },

    // Same with `retrieve`.
    showCustomer: function (req, res) {
      var agentID = req.param('agentID');
      var customerID = req.param('customerID');

      Agent.find(agentID).populate(customerID).exec(function (err, customer) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('customers/agent_view/retrieve', {
              customer: customer,
          });
        }
      });
    },

    update: function (req, res) {
      var agentID = req.param('agent');

      Agent.update(agentID, req.body).exec(function (err, agent) {
        if (err) {
          res.send(404, { error: "Agent doesn't exist." });
        } else {
          // TODO(wenjun): Verify that redirect to correct page (GET method).
          res.redirect(req.url);
        }
      });
    },

    showUpdatePage: function (req, res) {
      var agentID = req.param('agentID');

      Agent.find(agentID).exec(function (err, agent) {
        if (err) {
          res.send(500, { error: "Database Error." });
        } else {
          res.view('agents/update', agent);
        }
      });
    }
  };
};