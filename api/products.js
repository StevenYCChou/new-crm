var Promise = require('promise');
var AWS = require('aws-sdk');
var configs = require('../configs.js');
var restfulHelper = require('./restful_helper.js');
var simpledb = new AWS.SimpleDB({credentials: configs.simpleDb.creds, region: configs.simpleDb.region});

exports.getProducts = function (req, res) {
  var constraints = req.constraints;

  var select_string = '';
  var count_string = 'select count(*) from Product ';
  var where_string = '';
  var limit_string = '';
  var offset_string = '';

  if (constraints.field) {
    select_string = 'select ' + constraints.field.join(',') + ' from Product ';
  } else {
    select_string = 'select * from Product ';
  }
  if (constraints.query) {
    for (var key in constraints.query) {
      if (constraints.query.hasOwnProperty(key)) {
        where_string += " where " + key + " = '" + constraints.query[key] + "' ";
      }
    }
  }
  if (constraints.limit) {
    limit_string = ' limit ' + constraints.limit;
  }

  var simpleDbSelectPromise = Promise.denodeify(simpledb.select.bind(simpledb));
  var queryPromise;
  if (constraints.offset) {
    var offsetParams = {SelectExpression: count_string + where_string + offset_string};
    queryPromise = simpleDbSelectPromise(offsetParams).then(function(data) {
      var queryParams = {
        SelectExpression: select_string + where_string + limit_string,
        NextToken: data.NextToken
      };
      return simpleDbSelectPromise(queryParams);
    });
  } else {
    var queryParams = {SelectExpression: select_string + where_string + limit_string};
    queryPromise = simpleDbSelectPromise(queryParams);
  }

  var countPromise = simpleDbSelectPromise({
    SelectExpression: count_string + where_string
  });

  Promise.all([queryPromise, countPromise])
         .then(function(results) {
    var subCollection = results[0];
    var collectionSize = parseInt(results[1].Items[0].Attributes[0].Value); // hack on count attribute
    var data = [];
    var links = [];
    subCollection.Items.forEach(function(product) {
      var productObj = {};
      product.Attributes.forEach(function(attribute) {
        if (attribute.Name == 'Category') {
          if (productObj[attribute.Name] == undefined) {
            productObj[attribute.Name] = [];
          }
          productObj[attribute.Name].push(attribute.Value);
        } else {
          productObj[attribute.Name] = attribute.Value;
        }
      });
      productObj.id = product.Name;
      productObj.links = [{
        rel: 'self',
        href: '/api/v1.00/entities/products/' + product.Name
      }];
      data.push(productObj);
    });

    var links = restfulHelper.constructLinks('/api/v1.00/entities/agents',
                                             constraints.offset,
                                             data.length,
                                             constraints.query,
                                             req.query.field,
                                             collectionSize);
    res.json({
      data: data,
      links: links
    });
  }, function(err) {
    res.json(err);
  });
};

exports.getProduct = function (req, res) {
  var params = {
    DomainName: 'Product',
    ItemName: req.params.id
  }
  if (req.constraints.field) {
    params.AttributeNames = req.constraints.field;
  }
  simpledb.getAttributes(params, function(err, result) {
    if (err) {
      res.json({err: err});
    } else {
      productObj = {};
      links = [];
      result.Attributes.forEach(function(attribute) {
        if (attribute.Name == 'Category') {
          if (productObj[attribute.Name] == undefined) {
            productObj[attribute.Name] = [];
          }
          productObj[attribute.Name].push(attribute.Value);
        } else {
          productObj[attribute.Name] = attribute.Value;
        }
      });
      productObj.id = req.params.id;
      productObj.links = [{
        rel: 'self',
        href: '/api/v1.00/entities/products/' + req.params.id
      }];
      res.json(productObj);
    }
  });
};