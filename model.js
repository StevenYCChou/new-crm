var path = require('path');
var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;

console.log('Try to connect to MongoDB via Mongoose ...');
mongoose.connect('mongodb://localhost/mydb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error:'));

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

var AgentSchema = new BasicPersonSchema();
var CustomerSchema = new BasicPersonSchema({
  agent : { type: Schema.Types.ObjectId, ref: 'Agent' }
});

/* BasicRelationshipSchema */
function BasicRelationshipSchema() {
  Schema.apply(this, arguments);
  this.add({
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  });
};
util.inherits(BasicRelationshipSchema, Schema);

var ContactHistorySchema = new BasicRelationshipSchema({
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


