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

exports.getAgents = agentAPI.getAgents;
exports.getAgent = agentAPI.getAgent;
exports.createAgent = agentAPI.createAgent;
exports.updateAgent = agentAPI.updateAgent;
exports.removeAgent = agentAPI.removeAgent;

exports.getCustomers = customerAPI.getCustomers;
exports.getCustomer = customerAPI.getCustomer;
exports.createCustomer = customerAPI.createCustomer;
exports.updateCustomer = customerAPI.updateCustomer;
exports.removeCustomer = customerAPI.removeCustomer;

exports.getContactRecords = contactRecordAPI.getContactRecords;
exports.getContactRecord = contactRecordAPI.getContactRecord;
exports.createContactRecord = contactRecordAPI.createContactRecord;
exports.updateContactRecord = contactRecordAPI.updateContactRecord;
exports.removeContactRecord = contactRecordAPI.removeContactRecord;

exports.getProducts = productAPI.getProducts;
exports.getProduct = productAPI.getProduct;
exports.createProduct = productAPI.createProduct;
exports.updateProduct = productAPI.updateProduct;
exports.removeProduct = productAPI.removeProduct;

// exports.getProducts = function (req, res) {
//   if (JSON.stringify(req.query) == '{}' || (req.query.category == 'All' && req.query.searchKey == ''))
//     query = '';
//   else if (req.query.category == 'All' && req.query.searchKey != '')
//     query = " where Name like '%" + req.query.searchKey + "%'";
//   else if (req.query.category != 'All' && req.query.searchKey == '')
//     query = " where Category = '" + req.query.category + "'";
//   else
//     query = " where Category = '" + req.query.category + "' and Name like '%" + req.query.searchKey + "%'";
//   var params = {
//     SelectExpression: 'select * from Product ' + query,
//     ConsistentRead: true || false
//   };
//   simpledb.select(params, function(err, data) {
//     if (err) {
//       res.json({err: err});
//     }
//     else{
//       if (data["Items"] != undefined){
//         var product_new = [];
//         var tmp2;
//         var tmp3 = [];
//         var cateValue = '';
//         data["Items"].forEach(function(item){
//           tmp3 = [];
//           cateValue = '';
//           item["Attributes"].forEach(function(attr){
//             if (attr.Name != 'Category'){
//               tmp3.push({
//                 Name: attr.Name,
//                 Value: attr.Value,
//               });
//             } else {
//               cateValue += attr.Value + ', ';
//             }
//           });
//           tmp3.push({
//             Name: 'Category',
//             Value: cateValue.substring(0, cateValue.length-2),
//           });
//           tmp2 = {
//             Name: item["Name"],
//             Attributes: tmp3
//           };
//           product_new.push(tmp2);
//         });
//         res.json({products: product_new});
//       } else {
//         res.json({products: data["Items"]});
//       }
//     }    
//   });
// };

// exports.getProductDetail = function (req, res) {
//   var params = {
//     Key: { 
//       ProductID: { 
//         S: req.param('productId'),
//       },
//     },
//     TableName: 'Product', 
//     AttributesToGet: [
//       'shortDescription',
//       'longDescription',
//       'sellerComments',
//       'imageLink'
//     ],
//   };

//   dynamodb.getItem(params, function(err, data) {
//     if (err){
//       console.log(err, err.stack); // an error occurred
//       res.json({err: err});
//     }
//     else{ 
//       console.log(JSON.stringify(dynamoJSON.unwrap(data["Item"])));           // successful response
//       res.json({data: dynamoJSON.unwrap(data["Item"])});
//     }
//   });
// };

// exports.createProduct = function (req, res) {
//   var tmp = [];
//   var tmp2 = [];
//   var dynamoArributes = [
//     'shortDescription',
//     'longDescription',
//     'sellerComments',
//     'imageLink'
//   ];

//   for (var key in req.body){
//     if (req.body[key] instanceof Array){
//       req.body[key].forEach(function(v){
//         tmp.push({
//           Name: key,
//           Value: v,
//           Replace: false,
//         });
//       });
//     } else {
//       if (dynamoArributes.indexOf(key) == -1) {
//         tmp.push({
//           Name: key,
//           Value: req.body[key].toString(),
//           Replace: true,
//         });
//       }
//     }
//   }
//   tmp2.push({
//     Attributes : tmp,
//     Name: req.body['id'].toString(),
//   });
//   var params_new = {
//     DomainName: 'Product', 
//     Items: tmp2
//   };
//   console.log(params_new);
//   simpledb.batchPutAttributes(params_new, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   }); 
//   var params = {
//     Item: { 
//       ProductID: { 
//         S: req.body['id'].toString(),
//       },
//       shortDescription: { 
//         S: req.body['shortDescription'].toString(),
//       },
//       longDescription: { 
//         S: req.body['longDescription'].toString(),
//       },
//       sellerComments: { 
//         S: req.body['sellerComments'].toString(),
//       },
//       imageLink: { 
//         S: req.body['imageLink'].toString(),
//       },
//     },
//     TableName: 'Product', 
//   };
//   dynamodb.putItem(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });
//   res.render('manager/products');
// };

// exports.removeProduct = function (req, res) {
//   var productId = req.param('productId');
//   var params = {
//     DomainName: 'Product',
//     Items: [
//       {
//         Name: productId,
//       },
//     ]
//   };
//   simpledb.batchDeleteAttributes(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });

//   var params = {
//     Item: {
//       ProductID: {
//         S: productId,
//       },
//     },
//     TableName: 'Product',
//   };
//   dynamodb.deleteItem(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });
//   res.render('manager/products');
// };

// exports.updateProduct = function (req, res) {
//   if (req.body['updatetype'] == 'summary'){
//     var tmp = [];
//     req.body['summary']['products'][0]['Attributes'].forEach(function(attr){
//       tmp.push({
//         Name: attr.Name,
//         Value: attr.Value,
//         Replace: true,
//       });
//     });
//     var new_attr = {Attributes : tmp,
//       DomainName: 'Product',
//       ItemName: req.body['summary']['products'][0]['Name']
//     };
//     simpledb.putAttributes(new_attr, function(err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else     console.log(data);           // successful response
//     });
//     res.render('manager/products');
//   } else if (req.body['updatetype'] == 'detail'){
//     var params = {
//       Key: {
//         ProductID: {
//           S: req.body['detail']['productId'].toString(),
//         },
//       },
//       TableName: 'Product',
//       AttributeUpdates:{
//         shortDescription: {
//           Action: 'PUT',
//           Value: {
//             S: req.body['detail']['shortDescription'].toString(),
//           }
//         },
//         longDescription: {
//           Action: 'PUT',
//           Value: {
//             S: req.body['detail']['longDescription'].toString(),
//           }
//         },
//         sellerComments: {
//           Action: 'PUT',
//           Value: {
//             S: req.body['detail']['sellerComments'].toString(),
//           }
//         },
//       },

//     };
//     dynamodb.updateItem(params, function(err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else     console.log(data);           // successful response
//     });
//     res.render('manager/productDetail');
//   }
// };
