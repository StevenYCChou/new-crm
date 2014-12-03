var agentAPI = require('./api/agents.js');
var customerAPI = require('./api/customers.js');
var contactRecordAPI = require('./api/contact_records.js');
var productAPI = require('./api/products.js');

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

exports.getAgents = agentAPI.getAgents;
exports.getAgent = agentAPI.getAgent;
exports.getCustomers = customerAPI.getCustomers;
exports.getCustomer = customerAPI.getCustomer;
exports.getContactRecords = contactRecordAPI.getContactRecords;
exports.getContactRecord = contactRecordAPI.getContactRecord;
exports.getProducts = productAPI.getProducts;
exports.getProduct = productAPI.getProduct;


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

