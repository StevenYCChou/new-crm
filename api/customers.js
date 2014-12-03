var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var restfulHelper = require('./restful_helper.js');

exports.getCustomers = function (req, res) {
  var constraints = req.constraints;
  var subcollectionQuery, subcollectionPromise;
  if (constraints.query) {
    subcollectionQuery = mongodbService.Customer.find(constraints.query);
  } else {
    subcollectionQuery = mongodbService.Customer.find({});
  }
  if (constraints.offset) {
    subcollectionQuery = subcollectionQuery.skip(constraints.offset);
  }
  if (constraints.limit) {
    subcollectionQuery = subcollectionQuery.limit(constraints.limit);
  }
  if (constraints.field) {
    subcollectionQuery = subcollectionQuery.select(restfulHelper.getMongooseFields(constraints.field));
  }
  subcollectionPromise = Promise.resolve(subcollectionQuery.exec());

  var countQuery, countPromise;
  if (constraints.query) {
    countQuery = mongodbService.Customer.find(constraints.query);
  } else {
    countQuery = mongodbService.Customer.find({});
  }
  countQuery = countQuery.count();
  countPromise = Promise.resolve(countQuery.exec());

  Promise.all([subcollectionPromise, countPromise])
         .then(function(results) {
    var subCollection = results[0];
    var collectionSize = results[1];
    var data = [];
    subCollection.forEach(function(customer, idx, customers) {
      data[idx] = customer.toJSON();
      delete data[idx].agent;
      data[idx].links = [{
        rel: "self",
        href: "/api/v1.00/entities/customers/"+customer._id
      }, {
        rel: "agent",
        href: "/api/v1.00/entities/agents/"+customer.agent
      }];
    });
    var links = restfulHelper.constructLinks('/api/v1.00/entities/customers',
                                             constraints.offset,
                                             data.length,
                                             constraints.query,
                                             req.query.field,
                                             collectionSize);
    res.json({
      _type: "customer",
      data: data,
      links: links
    });
  }, function(err) {
    res.status(404).end();
  });
};

exports.getCustomer = function (req, res) {
  var query = mongodbService.Customer.findOne({_id: req.params.id});
  if (req.constraints.field) {
    query = query.select(restfulHelper.getMongooseFields(req.constraints.field));
  }
  var promise = query.exec();

  promise.then(function(customer) {
    var data = customer.toJSON();
    var links = [{
      rel: "self",
      href: "/api/v1.00/entities/customer/"+customer._id
    }];
    if (data.agent) {
      links.push({
        rel: "agent",
        href: "/api/v1.00/entities/agents/"+customer.agent
      });
      delete data.agent;
    }

    res.json({
      _type: "customer",
      data: data,
      links: links
    });
  }, function(err) {
    res.json({error: err});
  });
};