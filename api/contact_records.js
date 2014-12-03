var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var restfulHelper = require('./restful_helper.js');

exports.getContactRecords = function (req, res) {
  var constraints = req.constraints;
  var subcollectionQuery, subcollectionPromise;
  if (constraints.query) {
    subcollectionQuery = mongodbService.ContactRecord.find(constraints.query);
  } else {
    subcollectionQuery = mongodbService.ContactRecord.find({});
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
    countQuery = mongodbService.ContactRecord.find(constraints.query);
  } else {
    countQuery = mongodbService.ContactRecord.find({});
  }
  countQuery = countQuery.count();
  countPromise = Promise.resolve(countQuery.exec());

  Promise.all([subcollectionPromise, countPromise])
         .then(function(results) {
    var subCollection = results[0];
    var collectionSize = results[1];
    var data = [];
    subCollection.forEach(function(contactRecord, idx, contactRecords) {
      data[idx] = contactRecord.toJSON();
      delete data[idx].agent;
      delete data[idx].customer;
      data[idx].links = [{
        rel: "self",
        href: "/api/v1.00/entities/contact_records/"+contactRecord._id
      }, {
        rel: "agent",
        href: "/api/v1.00/entities/agents/"+contactRecord.agent
      }, {
        rel: "customer",
        href: "/api/v1.00/entities/customers/"+contactRecord.customer
      }];
    });
    var links = restfulHelper.constructLinks('/api/v1.00/entities/contact_records',
                                             constraints.offset,
                                             data.length,
                                             constraints.query,
                                             req.query.field,
                                             collectionSize);
    res.json({
      _type: "contact_recrods",
      data: data,
      links: links
    });
  }, function(err) {
    res.status(404).end();
  });
};

exports.getContactRecord = function (req, res) {
  var id = req.params.id;
  var query = mongodbService.ContactRecord.findOne({_id: id});
  if (req.constraints.field) {
    query = query.select(restfulHelper.getMongooseFields(req.constraints.field));
  }
  var promise = query.exec();

  console.log("[api.getContactRecord] Get Contact Record:" + id);
  promise.then(function(contact_record) {
    var data = contact_record.toJSON();
    var links = [{
      rel: "self",
      href: "/api/v1.00/entities/customer/"+data._id
    }];
    if (data.agent) {
      links.push({
        rel: "agent",
        href: "/api/v1.00/entities/agents/"+data.agent
      });
      delete data.agent;
    }
    if (data.customer) {
      links.push({
        rel: "customer",
        href: "/api/v1.00/entities/customers/"+data.customer
      });
      delete data.agent;
    }

    res.json({
      _type: "contact_record",
      data: data,
      links: links
    });
  }, function(err) {
    res.json({error: err});
  });
};