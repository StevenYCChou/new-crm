var mongodbService = require('./data_service/mongodb_service.js');
var AWS = require('aws-sdk');
var configs = require('./configs.js');
var simpledb = new AWS.SimpleDB({credentials: configs.simpleDb.creds, region: configs.simpleDb.region});
var dynamodb = new AWS.DynamoDB({credentials: configs.dynamoDb.creds, region: configs.dynamoDb.region});
var s3 = new AWS.S3({credentials: configs.s3.creds, region: configs.s3.region});
var dynamoJSON = require('dynamodb-data-types').AttributeValue;

var Promise = require('promise');
var Qs = require('qs');

var crmService = require('./business_service/internal/crm_service.js');
var crmValidation = require('./business_service/validation/validation.js');

function getCachedResponse(nonce, callback, res) {
  console.log(nonce);
  if (!nonce) {
    res.status(403).json({msg: "Modification request doesn't include nonce."});
  } else {
    mongodbService.Response.findOne({nonce: nonce}).exec().then(function (responseEntry){
      if (responseEntry === null) {
        console.log("[api.getCachedResponse] Response is not cached.");
        res.status(202).json({});
        mongodbService.Response.create({nonce: nonce}).then(function() {
          console.log("[api.getCachedResponse] process data");
          return callback();
        }).then(function(response) {
          console.log("[api.getCachedResponse] Update response cache with successful response");
          return mongodbService.Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: response}}).exec();
        }, function(error) {
          console.log("[api.getCachedResponse] Update response cache with failure response");
          return mongodbService.Response.update({nonce: nonce}, {$set : {status: "COMPLETED", response: error}}).exec();
        }).then(function() {
          console.log("[api.getCachedResponse] finish process.");
        }).else(function(err) {
          console.log(err);
        });
      } else if (responseEntry.status === "COMPLETED") {
        console.log("[api.getCachedResponse] Response is processed and cached.");
        res.status(200).json({response: responseEntry.response});
      } else {
        console.log("[api.getCachedResponse] Response is processed but not cached.");
        res.status(202).json({});
      }
    }, function(err) {
      console.log("[api.getCachedResponse] Error occurs");
    });
  }
}

var getQueryConstraints = function (req) {
  var constraints = {};
  if (req.query.limit) {
    constraints.limit = parseInt(req.query.limit);
  }
  if (req.query.offset) {
    constraints.offset = parseInt(req.query.offset);
  }
  if (req.query.q) {
    constraints.query = Qs.parse(req.query.q, { delimiter: ',' });
  }
  if (req.query.field) {
    var fields = req.query.field.split(',');
    var field_query_obj = {};
    fields.forEach(function(field) {
      field_query_obj[field] = 1;
    });
    constraints.field = field_query_obj;
  }
  return constraints;
}


var getLink = function (endpoint, offset, limit, query, field) {
  var link_constraints = {
    offset: offset,
    limit: limit,
    q: query,
    field: field
  }
  var query_string = Qs.stringify(link_constraints);
  if (query_string === "") {
    return endpoint;
  } else {
    return endpoint+'?'+Qs.stringify(link_constraints);
  }
};

var constructLinks = function(endpoint, offset, limit, original_query, field, collectionSize) {
  var query_string;
  if (original_query) {
    query_string = Qs.stringify(original_query, { delimiter: ',' });
  }
  var res = [];
  if (limit != 0) {
    res[res.length] = {rel: "first", href: getLink(endpoint, 0, limit, query_string, field)};
    res[res.length] = {rel: "last", href: getLink(endpoint, collectionSize - limit, limit, query_string, field)};
    if (offset > 0 &&
        collectionSize != limit) {
      var prev_offset = (offset >= limit) ? (offset - limit) : 0;
      res[res.length] = {rel: "prev", href: getLink(endpoint, prev_offset, limit, query_string, field)};
    }
    if (offset >= 0 &&
        offset + limit < collectionSize &&
        collectionSize != limit) {
      var next_offset = offset + limit;
      res[res.length] = {rel: "next", href: getLink(endpoint, next_offset, limit, query_string, field)};
    }
  }
  return res;
}

exports.getAgents = function (req, res) {
  var constraints = getQueryConstraints(req);
  var subcollectionQuery, subcollectionPromise;
  if (constraints.query) {
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
    subcollectionQuery = subcollectionQuery.select(constraints.field);
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
    var links = constructLinks('/api/v1.00/entities/agents',
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

  var promise = mongodbService.Agent.findOne({_id: id}, {__v: 0}).exec();
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

exports.updateAgent = function (req, res) {
  var agentId = req.param('id');
  var updateInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email'),
    location: req.param('location'),
    lastUpdatedAt: Date.now()
  };
  var update = function () {
    console.log("[api.updateAgent] Update Agent:" + updateInfo.name);
    return crmService.updateAgentById(agentId, updateInfo).exec();
  };
  getCachedResponse(req.get('nonce'), update, res);
};

exports.createAgent = function (req, res) {
  var agentInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email'),
    location: req.param('location')
  };
  var creation = function () {
    console.log("[api.createAgent] Create New Agent:" + agentInfo.name);
    return crmService.createAgent(agentInfo);
  };
  getCachedResponse(req.get('nonce'), creation, res);
};

exports.removeAgent = function (req, res) {
  var agentId = req.param('id');
  var deletion = function () {
    console.log("[api.removeAgent] Remove Agent:" + agentId);
    mongodbService.Agent.findByIdAndRemove(agentId).exec();
  };
  getCachedResponse(req.get('nonce'), deletion, res);
};

exports.getCustomers = function (req, res) {
  var constraints = getQueryConstraints(req);
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
    subcollectionQuery = subcollectionQuery.select(constraints.field);
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
    var links = constructLinks('/api/v1.00/entities/customers',
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
  var id = req.params.id;
  var promise = mongodbService.Customer.findOne({_id: id}, {__v: 0}).exec();
  promise.then(function(customer) {
    data = customer.toJSON();
    delete data.agent;
    data.links = [{
      rel: "self",
      href: "/api/v1.00/entities/customer/"+customer._id
    }];
    res.json({
      _type: "customer",
      data: data
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
    email: req.param('email'),
    location: req.param('location'),
    lastUpdatedAt: Date.now()
  };
  var update = function () {
    console.log("[api.updateCustomer] Update Customer:" + updateInfo.name);
    crmValidation.updateCustomerContactValidation(customerId, function(err) {
      if (err) {
        return err;
      } else {
        return mongodbService.Customer.findByIdAndUpdate(customerId, updateInfo).exec();
      }
    });
  };
  getCachedResponse(req.get('nonce'), update, res);
};

exports.createCustomer = function (req, res) {
  var customerInfo = {
    name: req.param('name'),
    phone: req.param('phone'),
    email: req.param('email'),
    location: req.param('location'),
    agent: req.param('agentId')
  };

  var creation = function () {
    console.log("[api.createCustomer] Create Customer:" + customerInfo.name);
    crmValidation.createCustomerValidation(customerInfo.agent, function(err) {
      if (err) {
        return err;
      } else {
        return mongodbService.Customer.create(customerInfo);
      }
    });
  };

  getCachedResponse(req.get('nonce'), creation, res);
};

exports.removeCustomer = function (req, res) {
  var customerId = req.param('id');
  var deletion = function () {
    console.log("[api.removeCustomer] Remove Customer:" + customerId);
    mongodbService.Customer.findByIdAndRemove(customerId).exec();
  };
  getCachedResponse(req.get('nonce'), deletion, res);
};

exports.getContactRecords = function (req, res) {
  var constraints = getQueryConstraints(req);
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
    subcollectionQuery = subcollectionQuery.select(constraints.field);
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
    var links = constructLinks('/api/v1.00/entities/contact_records',
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
  console.log("[api.getContactRecord] Get Contact Record:" + id);
  var promise = mongodbService.ContactRecord.findOne({_id: id}, {__v: 0}).exec();
  promise.then(function(contact_record) {
    contact_record = contact_record.toJSON();
    contact_record.link = {
      rel: "self",
      href: "/api/v1.00/entities/customer/"+contact_record._id
    };
    res.json({
      _type: "contact_record",
      contact_record: contact_record
    });
  }, function(err) {
    res.json({error: err});
  });
};

exports.createContactRecord = function (req, res) {
  var newContactRecord = {
    time : req.param('time'),
    data : req.param('data'),
    textSummary : req.param('textSummary'),
    model : req.param('model'),
    agent: req.param('agentId'),
    customer: req.param('customerId')
  };
  var creation = function () {
    console.log("[api.createContactRecord] Create Contact Record:" + newContactRecord.textSummary);
    return mongodbService.ContactRecord.create(newContactRecord);
  };
  getCachedResponse(req.get('nonce'), creation, res);
};

exports.updateContactRecord = function (req, res) {
  var contactRecordId = req.param('id');
  var updatedContactRecord = {
    time : req.param('time'),
    data : req.param('data'),
    textSummary : req.param('textSummary'),
    model : req.param('model'),
    agent: req.param('agentId'),
    customer: req.param('customerId')
  };
  var update = function () {
    console.log("[api.updateContactRecord] Update contact record:" + updateInfo.name);
    return mongodbService.ContactRecord.findByIdAndUpdate(contactRecordId, updatedContactRecord);
  };
  getCachedResponse(req.get('nonce'), update, res);
};

exports.removeContactRecord = function (req, res) {
  var contactRecordId = req.param('id');
  var deletion = function () {
    console.log("[api.removeContactRecord] Remove contact record:" + contactRecordId);
    return mongodbService.ContactRecord.findByIdAndRemove(contactRecordId).exec();
  };
  getCachedResponse(req.get('nonce'), deletion, res);
};

exports.getProducts = function (req, res) {
  if (JSON.stringify(req.query) == '{}' || req.query.category == 'All')
    query = '';
  else
    query = " where Category = '" + req.query.category + "'";
  var params = {
    SelectExpression: 'select * from Product ' + query,
    ConsistentRead: true || false
  };
  simpledb.select(params, function(err, data) {
    if (err) {
      res.json({err: err});
    }
    else{
      res.json({products: data["Items"]});
    }    
  });
};

exports.getProductDetail = function (req, res) {
  var params = {
    Key: { 
      ProductID: { 
        S: req.param('productId'),
      },
    },
    TableName: 'Product', 
    AttributesToGet: [
      'shortDescription',
      'longDescription',
      'sellerComments',
      'imageLink'
    ],
  };

  dynamodb.getItem(params, function(err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      res.json({err: err});
    }
    else{ 
      console.log(JSON.stringify(dynamoJSON.unwrap(data["Item"])));           // successful response
      res.json({data: dynamoJSON.unwrap(data["Item"])});
    }
  });
};

exports.createProduct = function (req, res) {
  var tmp = [];
  var tmp2 = [];
  tmp.push({
    Name: 'Name',
    Value: req.body['Name'].toString(),
    Replace: true,
  },
  {
    Name: 'Price',
    Value: req.body['Price'].toString(),
    Replace: true || false
  });
  req.body['category'].forEach(function(cate){
    if (cate.data == true){
      tmp.push({
        Name: 'Category',
        Value: cate.name,
        Replace: false,
      });
    }
  });
  tmp.push({
    Name: req.body['Field1'].toString(),
    Value: req.body['Value1'].toString(),
    Replace: true || false
  });
  tmp2.push({
    Attributes : tmp,
    Name: req.body['Id'].toString(),
  });
  var params_new = {
    DomainName: 'Product', 
    Items: tmp2
  };
  simpledb.batchPutAttributes(params_new, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  }); 
  var params = {
    Item: { 
      ProductID: { 
        S: req.body['Id'].toString(),
      },
      shortDescription: { 
        S: req.body['shortDescription'].toString(),
      },
      longDescription: { 
        S: req.body['longDescription'].toString(),
      },
      sellerComments: { 
        S: req.body['sellerComments'].toString(),
      },
      imageLink: { 
        S: req.body['imageLink'].toString(),
      },
    },
    TableName: 'Product', 
  };
  dynamodb.putItem(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

//  console.log(req.body);
 /* var params = {
    Bucket: 'crm-images-fs2488',
    Key: req.body['uniqueFileName'],
    ContentType: req.body['imageFile'].type,
    Body: req.body['imageFile'],
    ServerSideEncryption: 'AES256'
  };
  console.log(params);
  s3.putObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });*/
  res.render('manager/products');
};

exports.removeProduct = function (req, res) {
  var productId = req.param('productId');
  var params = {
    DomainName: 'Product',
    Items: [
      {
        Name: productId,
      },
    ]
  };
  simpledb.batchDeleteAttributes(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

  var params = {
    Item: {
      ProductID: {
        S: productId,
      },
    },
    TableName: 'Product',
  };
  dynamodb.deleteItem(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
  res.render('manager/products');
};

exports.updateProduct = function (req, res) {
  if (req.body['updatetype'] == 'summary'){
    var tmp = [];
    req.body['summary']['products'][0]['Attributes'].forEach(function(attr){
      tmp.push({
        Name: attr.Name,
        Value: attr.Value,
        Replace: true,
      });
    });
    var new_attr = {Attributes : tmp,
      DomainName: 'Product',
      ItemName: req.body['summary']['products'][0]['Name']
    };
    simpledb.putAttributes(new_attr, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
    res.render('manager/products');
  } else if (req.body['updatetype'] == 'detail'){
    var params = {
      Key: {
        ProductID: {
          S: req.body['detail']['productId'].toString(),
        },
      },
      TableName: 'Product',
      AttributeUpdates:{
        shortDescription: {
          Action: 'PUT',
          Value: {
            S: req.body['detail']['shortDescription'].toString(),
          }
        },
        longDescription: {
          Action: 'PUT',
          Value: {
            S: req.body['detail']['longDescription'].toString(),
          }
        },
        sellerComments: {
          Action: 'PUT',
          Value: {
            S: req.body['detail']['sellerComments'].toString(),
          }
        },
      },

    };
    dynamodb.updateItem(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
    res.render('manager/productDetail');
  }
};

