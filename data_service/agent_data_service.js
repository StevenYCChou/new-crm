var mongoose = require('mongoose');
var crmBasicSchemas = require('./crm_basic_schemas.js');
var agentSchema = new crmBasicSchemas.BasicPersonSchema();
module.exports = mongoose.model('Agent', agentSchema);