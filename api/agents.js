var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var restfulHelper = require('./restful_helper.js');

exports.getAgents = function (req, res) {
  var constraints = req.constraints;
  var subcollectionQuery, subcollectionPromise;
  if (req.constraints.query) {
    subcollectionQuery = mongodbService.Agent.find(constraints.query);
  } else {
    subcollectionQuery = mongodbService.Agent.find({});
  }
  if (constraints.offset) {
    subcollectionQuery = subcollectionQuery.skip(constraints.offset);
  }
  if (constraints.limit) {
    subcollectionQuery = subcollectionQuery.limit(constraints.limit);
  }
  if (constraints.field) {
    var fields_obj = restfulHelper.getMongooseFields(constraints.field);
    subcollectionQuery = subcollectionQuery.select(fields_obj);
  }

  subcollectionPromise = Promise.resolve(subcollectionQuery.exec());

  var countQuery, countPromise;
  if (constraints.query) {
    countQuery = mongodbService.Agent.find(constraints.query);
  } else {
    countQuery = mongodbService.Agent.find({});
  }
  countQuery = countQuery.count();
  countPromise = Promise.resolve(countQuery.exec());

  Promise.all([subcollectionPromise, countPromise])
         .then(function(results) {
    var subCollection = results[0];
    var collectionSize = results[1];
    var data = [];
    subCollection.forEach(function(agent, idx, agents) {
      data[idx] = agent.toJSON();
      data[idx].link = {
        rel: "self",
        href: "/api/v1.00/entities/agents/"+agent._id
      };
    });
    var links = restfulHelper.constructLinks('/api/v1.00/entities/agents',
                                             constraints.offset,
                                             data.length,
                                             constraints.query,
                                             req.query.field,
                                             collectionSize);
    res.json({
      _type: "agent",
      data: data,
      links: links
    });
  }, function(err) {
    res.status(404).end();
  });
};

exports.getAgent = function(req, res) {
  var id = req.params.id;
  var query = mongodbService.Agent.findOne({_id: id});
  if (req.constraints.field) {
    query = query.select(restfulHelper.getMongooseFields(req.constraints.field));
  }
  var promise = query.exec();

  promise.then(function(agent) {
    data = agent.toJSON();
    data.links = [{
      rel: "self",
      href: "/api/v1.00/entities/agents/"+agent._id
    }];
    res.json({
      _type: "agent",
      data: data
    });
  }, function(err) {
    res.status(404).end();
  });
}