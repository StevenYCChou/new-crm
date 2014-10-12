var path = require('path');
var mongoose = require('mongoose');
var util = require('util');


var Schema = mongoose.Schema;

/* BasicPersonSchema */
function BasicPersonSchema() {
  Schema.apply(this, arguments);

  this.add({
    name: String,
    phone: String,
    email: String
  });
}
util.inherits(BasicPersonSchema, Schema);

var AgentSchema = new BasicPersonSchema({
  customers : [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});
var CustomerSchema = new BasicPersonSchema({
  agent : { type: Schema.Types.ObjectId, ref: 'Agent' }
});

  console.log('Try to connect to MongoDB via Mongoose ...');
  mongoose.connect('mongodb://localhost/mydb');
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'Mongoose connection error:'));

var BinaryDataSchema = Schema({data: Schema.Types.Mixed});

/* BasicRelationshipSchema */
function BasicRelationshipSchema() {
  Schema.apply(this, arguments);
  this.add({
    agentId: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    customerId: [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
  });
};
util.inherits(BasicRelationshipSchema, Schema);

var ContactHistorySchema = new BasicRelationshipSchema({
  time: Date,
  model: String, // phone OR email
  data: { type: Schema.Types.ObjectId, ref: 'BinaryData' },
  textSummary: String
});
  
models = {};
db.once('open', function callback() {
  var Agent = mongoose.model('Agent', AgentSchema);
  var Customer = mongoose.model('Customer', CustomerSchema);
  var ContactHistory = mongoose.model('ContactHistory', ContactHistorySchema);
  var BinaryData = mongoose.model('BinaryData', BinaryDataSchema);

  models['Agent'] = Agent;
  models['Customer'] = Customer;
  models['ContactHistory'] = ContactHistory;
  models['BinaryData'] = BinaryData;
});
module.exports = models;


