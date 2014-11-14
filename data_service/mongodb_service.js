var mongoose = require('mongoose');
var agentSchema = require('./schemas/agent_schema.js');
var customerSchema = require('./schemas/customer_schema.js');
var contactRecordSchema = require('./schemas/contact_record_schema.js');
var configs = require('../configs.js');

// Define model with Schema
mongoose.model('Agent', agentSchema);
mongoose.model('Customer', customerSchema);
mongoose.model('ContactRecord', contactRecordSchema);

console.log('Try to connect to MongoDB via Mongoose ...');
var db_address = configs.mongoDb.server_address + '/' + configs.mongoDb.db_name;
var conn = mongoose.createConnection(db_address);
conn.on('error', console.error.bind(console, 'Mongoose connection error:'));

exports.Agent = conn.model('Agent');
exports.Customer = conn.model('Customer');
exports.ContactRecord = conn.model('ContactRecord');
