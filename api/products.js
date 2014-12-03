var AWS = require('aws-sdk');
var configs = require('../configs.js');
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

  if (constraints.offset) {
    offset_string = ' limit ' + constraints.offset;
    simpledb.select({SelectExpression: count_string + where_string + offset_string}, function(err, data) {
      if (err) {
        res.json({err: err});
      } else {
        simpledb.select({SelectExpression: select_string + where_string + limit_string,
                         NextToken: data.NextToken}, function(err, results) {
          if (err) {
            res.json({err: err});
          } else {
            var data = [];
            results.Items.forEach(function(product) {
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
            res.json(data);
          }
        });
      }
    });
  } else {
    simpledb.select({SelectExpression: select_string + where_string + limit_string}, function(err, results) {
      if (err) {
        res.json({err: err});
      } else {
        var data = [];
        var links = [];
        results.Items.forEach(function(product) {
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
        res.json({
          data: data,
          links: links
        });
      }
    });
  }
  // var simpleDbSelectPromise = Promise.denodeify(simpledb.select);

  // var queryPromise;
  // if (constraints.offset) {
  //   var offsetParams = {SelectExpression: count_string + where_string + offset_string};
  //   queryPromise = simpleDbSelectPromise(offsetParams).then(function(data) {
  //     var queryParams = {SelectExpression: select_string + where_string + limit_string,
  //                     NextToken: data.NextToken};
  //     return simpleDbSelectPromise(queryParams);
  //   });
  // } else {
  //   var queryParams = {SelectExpression: select_string + where_string + limit_string};
  //   // queryPromise = simpleDbSelectPromise(queryParams);
  //   simpleDbSelectPromise(queryParams).then(function(data) {
  //     console.log(data);
  //     res.json(data);
  //   }, function(err) {
  //     console.log("error:"+err, err.stack);
  //     res.json(err);
  //   });
  // }
  // queryPromise.then(function(data) {
  //   console.log(data);
  //   res.json(data);
  // }, function(err) {
  //   console.log("error:"+err, err.stack);
  //   res.json(err);
  // })
};

exports.getProduct = function (req, res) {
  var params = {
    DomainName: 'Product',
    ItemName: req.params.id
  }
  if (req.constraints.field) {
    params.AttributeNames = req.constraints.field;
  }
  console.log(params);
  simpledb.getAttributes(params, function(err, result) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      res.json({err: err});
    } else {
      console.log(result);           // successful response
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
