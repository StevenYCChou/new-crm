var path = require('path');
var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;
var agentDataService = require('./data_service/agent_data_service.js');
var customerDataService = require('./data_service/customer_data_service.js');
var contactRecordDataService = require('./data_service/contact_record_data_service.js');

console.log('Try to connect to MongoDB via Mongoose ...');
mongoose.connect('mongodb://localhost/mydb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error:'));

models = {};
db.once('open', function callback() {
  models['Agent'] = agentDataService;
  models['Customer'] = customerDataService;
  models['ContactHistory'] = contactRecordDataService;
});
module.exports = models;


