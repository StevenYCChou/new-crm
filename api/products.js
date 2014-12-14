var Promise = require('promise');
var AWS = require('aws-sdk');
var configs = require('../configs.js');
var restfulHelper = require('./restful_helper.js');
var mongodbService = require('../data_service/mongodb_service.js');
var simpledb = new AWS.SimpleDB({credentials: configs.simpleDb.creds, region: configs.simpleDb.region});

var parseToAttributes = function(product) {
  var attributes = [];

  for (var key in product) {
    if (Array.isArray(product[key])) {
      product[key].forEach(function(v) {
        attributes.push({
          Name: key,
          Value: String(v)
        });
      });
    } else if (key !== 'id') {
      attributes.push({
        Name: key,
        Value: String(product[key])
      });
    }
  }
  return attributes;
}

var parseToAttributesUpdate = function(product) {
  var attributes = [];

  for (var key in product) {
    if (Array.isArray(product[key])) {
      product[key].forEach(function(v) {
        attributes.push({
          Name: key,
          Value: String(v),
          Replace: true
        });
      });
    } else if (key !== 'id') {
      attributes.push({
        Name: key,
        Value: String(product[key])
      });
    }
  }
  return attributes;
}

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
    var subCollection = results[0].Items || [];
    var collectionSize = parseInt(results[1].Items[0].Attributes[0].Value) || 0; // hack on count attribute
    var data = [];
    var links = [];
    subCollection.forEach(function(product) {
      var productObj = {};
      product.Attributes.forEach(function(attribute) {
        if (attribute.Name === 'category' || attribute.Name === 'Category') {
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

    var links = restfulHelper.constructLinks('/api/v1.00/entities/products',
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
        if (attribute.Name === 'category' || attribute.Name === 'Category') {
          if (!productObj[attribute.Name]) {
            productObj[attribute.Name] = [];
          }
          productObj[attribute.Name].push(attribute.Value);
        } else {
          productObj[attribute.Name] = attribute.Value;
        }
      });
      productObj.id = req.params.id;
      var links = [{
        rel: 'self',
        href: '/api/v1.00/entities/products/' + req.params.id
      }];
      res.json(
        {data: productObj,
          links: links}
        );
    }
  });
};

exports.createProduct = function (req, res) {
  var attributes = parseToAttributes(req.body);
  var params = {
    Attributes: attributes,
    DomainName: 'Product',
    ItemName: req.body.id
  }

  simpledb.putAttributes(params, function(err, response) {
    if (err) {
      return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: response}}).exec();
    }
  });
};

exports.updateProduct = function (req, res) {
  var attributes = parseToAttributesUpdate(req.body);
  var params = {
    Attributes: attributes,
    DomainName: 'Product',
    ItemName: req.param('id')
  }

  simpledb.putAttributes(params, function(err, response) {
    if (err) {
      return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: response}}).exec();
    }
  });
};

exports.removeProduct = function (req, res) {
  var id = req.param('id');
  simpledb.getAttributes({
    DomainName: 'Product',
    ItemName: id
  }, function(err, data) {
    if (err) {
      return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
    } else {
      simpledb.deleteAttributes({
        DomainName: 'Product',
        ItemName: id,
        Attributes: data.Attributes
      }, function(err, data) {
        if (err) {
          return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: err}}).exec();
        } else {
          return mongodbService.Response.update({nonce: req.headers.uuid}, {$set : {status: "COMPLETED", response: data}}).exec();
        }
      })
    }
  })
};
