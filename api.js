var mongodbService = require('./data_service/mongodb_service.js');
var Promise = require('promise');
var Qs = require('qs');

var crmService = require('./business_service/internal/crm_service.js');

var without_internal_field = {
  _id: 0,
  name: 1,
  email: 1,
  phone: 1
};

var validAgentQueryField = {
  id: undefined,
  name: undefined,
  phone: undefined,
  email: undefined
};

var validCustomerQueryField = {
  id: undefined,
  name: undefined,
  phone: undefined,
  email: undefined,
  agent: undefined
};

var validContactRecordQueryField = {
  id: undefined,
  time: undefined,
  model: undefined,
  agent: undefined,
  customer: undefined
};

var filter = function(obj, predicate) {
  var result = {}, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key) && predicate(key)) {
          result[key] = obj[key];
      }
  }
  return result;
};

// function(base, query) {
//   var links;
//   var prev = {
//     rel: "prev",
//     href: base,
//   }
// }

function getCachedResponse(nonce, callback, res) {
  mongodbService.Response.findOne({nonce: nonce}).exec().then(function (responseEntry){
    if (responseEntry === null) {
      console.log("[api.getCachedResponse] Response is not cached.");
      res.json({code: 202});
      mongodbService.Response.create({nonce: nonce}).then(function() {
        console.log("[api.getCachedResponse] process data");
        return callback();
      }).then(function(response) {
        console.log("[api.getCachedResponse] Update response cache");
        return mongodbService.Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: response}}).exec();
      }).then(function() {
        console.log("[api.getCachedResponse] finish process.");
      });
    } else if (responseEntry.status === "COMPLETED") {
      console.log("[api.getCachedResponse] Response is processed and cached.");
      res.json({code: 200, response: responseEntry.response});
    } else {
      console.log("[api.getCachedResponse] Response is processed but not cached.");
      res.json({code: 202});
    }
  });
}

exports.getAgents = function (req, res) {
  var offset = req.query.offset;
  var limit = req.query.limit;
  // var offset = (!req.query.offset) ? 5 : req.query.offset;
  // var limit = (!req.query.limit) ? 5 : req.query.limit;

  var q = req.query.q;
  var query = Qs.parse(q, { delimiter: ',' });

  var filteredQuery = filter(query, function(key) {return key in validAgentQueryField;});
  // var name_q = new RegExp(req.param('name'));

  var promise = mongodbService.Agent.find(filteredQuery, {__v: 0})
                                    .skip(offset)
                                    .limit(limit)
                                    .exec();
  promise.then(function(agents) {
    agents.forEach(function(agent, idx, agents) {
      agents[idx] = agents[idx].toJSON();
      agents[idx].link = {
        rel: "self",
        href: "/api/v1.00/entities/agents/"+agent._id
      };
    });
    res.json({
      _type: "agent",
      agents: agents,
      // links: [
      //   {rel: "prev", href: "/api/v1.00/entities/agents?"+Qs.stringify(req.query)}
      // ]
    });
  }, function(err) {
    res.json({error: err});
  });
};

exports.getAgent = function(req, res) {
  var id = req.params.id;

  var promise = mongodbService.Agent.findOne({_id: id}, {__v: 0}).exec();
  promise.then(function(agent) {
    agent = agent.toJSON();
    agent.link = {
      rel: "self",
      href: "/api/v1.00/entities/agents/"+agent._id
    };
    res.json({
      _type: "agent",
      agent: agent
    });
  }, function(err) {
    res.json({error: err});
  });
}

exports.updateAgent = function (req, res) {
  var agentId = req.param('id');
  var updateInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email')
  };
  var update = function () {
    console.log("[api.updateAgent] Update Agent:" + updateInfo.name);
    return mongodbService.Agent.findByIdAndUpdate(agentId, updateInfo).exec();
  };
  getCachedResponse(req.param('nonce'), update, res);
};

exports.createAgent = function (req, res) {
  var agentInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email')
  };

  var creation = function () {
    console.log("[api.createAgent] Create New Agent:" + agentInfo.name);
    return mongodbService.Agent.create(agentInfo);
  };
  getCachedResponse(req.param('nonce'), creation, res);
};

exports.getCustomers = function (req, res) {
  var offset = req.query.offset;
  var limit = req.query.limit;

  var q = req.query.q;
  var query = Qs.parse(q, { delimiter: ',' });
  var filteredQuery = filter(query, function(key) {return key in validCustomerQueryField;});
  // var name_q = new RegExp(req.param('name'));

  var promise = mongodbService.Customer.find(filteredQuery, {_id: 0, __v: 0})
                                    .skip(offset)
                                    .limit(limit)
                                    .exec();
  promise.then(function(customers) {
    res.json({
      _type: "customer",
      customers: customers
    });
  }, function(err) {
    res.json({error: err});
  });
};

exports.getCustomer = function (req, res) {
  var id = req.params.id;
  var promise = mongodbService.Customer.findOne({_id: id}, {__v: 0}).exec();
  promise.then(function(customer) {
    customer = customer.toJSON();
    customer.link = {
      rel: "self",
      href: "/api/v1.00/entities/customer/"+customer._id
    };
    res.json({
      _type: "customer",
      customer: customer
    });
  }, function(err) {
    res.json({error: err});
  });
};

exports.updateCustomer = function (req, res) {
  var customerId = req.param('id');
  var updateInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email')
  };
  var update = function () {
   console.log("[api.updateCustomer] Update Customer:" + updateInfo.name);
    return mongodbService.Customer.findByIdAndUpdate(customerId, updateInfo).exec();
  };
  getCachedResponse(req.param('nonce'), update, res);
};

exports.createCustomer = function (req, res) {
  var customerInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email'),
    agent: req.param('agentId')
  };
  var creation = function () {
    console.log("[api.createCustomer] Create Customer:" + customerInfo.name);
    return mongodbService.Customer.create(customerInfo);
  };
  getCachedResponse(req.param('nonce'), creation, res);
};

exports.removeCustomer = function (req, res) {
  var customerId = req.param('customerId');
  var deletion = function () {
    console.log("[api.removeCustomer] Remove Customer:" + customerId);
    mongodbService.Customer.findByIdAndRemove(customerId);
  };
  getCachedResponse(req.param('nonce'), deletion, res);
};

exports.getContactRecords = function (req, res) {
  var offset = req.query.offset;
  var limit = req.query.limit;

  var q = req.query.q;
  var query = Qs.parse(q, { delimiter: ',' });
  var filteredQuery = filter(query, function(key) {return key in validContactRecordQueryField;});

  var promise = mongodbService.ContactRecord.find(filteredQuery, {_id: 0, __v: 0})
                                    .skip(offset)
                                    .limit(limit)
                                    .exec();
  promise.then(function(contactRecords) {
    res.json(contactRecords);
  }, function(err) {
    res.json({error: err});
  });
};

exports.createContactRecord = function (req, res) {
  var newContactHistory = {
    time : req.param('time'),
    data : req.param('data'),
    textSummary : req.param('textSummary'),
    model : req.param('model'),
    agent: req.param('agentId'),
    customer: req.param('customerId'),
  };
  var creation = function () {
    console.log("[api.createContactRecord] Create Contact Record:" + newContactHistory.textSummary);
    return mongodbService.ContactHistory.create(newContactHistory);
  };
  getCachedResponse(req.param('nonce'), creation, res);
};

