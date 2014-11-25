var mongoose = require('mongoose');
var agentSchema = require('./schemas/agent_schema.js');
var customerSchema = require('./schemas/customer_schema.js');
var contactRecordSchema = require('./schemas/contact_record_schema.js');
var configs = require('../configs.js');

var responseSchema = new mongoose.Schema({
  nonce: String,
  status: { type: String, default: "INPROGRESS"},
  response: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, expires: '60s', default: Date.now}
});

// Define model with Schema
mongoose.model('Agent', agentSchema);
mongoose.model('Customer', customerSchema);
mongoose.model('ContactRecord', contactRecordSchema);
mongoose.model('Response', responseSchema);

console.log('Try to connect to MongoDB via Mongoose ...');
var db_address = configs.mongoDb.server_address + '/' + configs.mongoDb.db_name;
var conn = mongoose.createConnection(db_address);
conn.on('error', console.error.bind(console, 'Mongoose connection error:'));

exports.Agent = conn.model('Agent');
exports.Customer = conn.model('Customer');
exports.ContactRecord = conn.model('ContactRecord');
exports.Response = conn.model('Response');