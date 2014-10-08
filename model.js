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

var Agent = mongoose.model('Agent', AgentSchema);
var Customer = mongoose.model('Customer', CustomerSchema);

var BinaryDataSchema = Schema({data: Schema.Types.Mixed});
var BinaryData = mongoose.model('BinaryData', BinaryDataSchema);

/* BasicRelationshipSchema */
function BasicRelationshipSchema() {
  Schema.apply(this, arguments);
  this.add({
    agentId: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    customerId: [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
  });
};
util.inherits(BasicRelationshipSchema, Schema);

var ContactHistory = new BasicRelationshipSchema({
  time: Date,
  model: String, // phone OR email
  data: { type: Schema.Types.ObjectId, ref: 'BinaryData' },
  textSummary: String
});


models = {};
models['Agent'] = Agent;
models['Customer'] = Customer;
models['ContactHistory'] = ContactHistory;
models['BinaryData'] = BinaryData;
module.exports = models;
