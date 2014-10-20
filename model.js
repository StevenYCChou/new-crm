var path = require('path');
var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;
var crmSchema = require('./data_service/crm_schema.js');


console.log('Try to connect to MongoDB via Mongoose ...');
mongoose.connect('mongodb://localhost/mydb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error:'));

var AgentSchema = new crmSchema.BasicPersonSchema();
var CustomerSchema = new crmSchema.BasicPersonSchema({
  agent : { type: Schema.Types.ObjectId, ref: 'Agent' }
});

var ContactHistorySchema = new crmSchema.BasicRelationshipSchema({
  time: Date,
  model: String, // phone OR email
  data: String,
  textSummary: String
});
  
models = {};
db.once('open', function callback() {
  var Agent = mongoose.model('Agent', AgentSchema);
  var Customer = mongoose.model('Customer', CustomerSchema);
  var ContactHistory = mongoose.model('ContactHistory', ContactHistorySchema);

  models['Agent'] = Agent;
  models['Customer'] = Customer;
  models['ContactHistory'] = ContactHistory;
});
module.exports = models;


