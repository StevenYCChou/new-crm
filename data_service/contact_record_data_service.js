var mongoose = require('mongoose');
var crmBasicSchemas = require('./crm_basic_schemas.js');
var contactRecordSchema = new crmBasicSchemas.BasicRelationshipSchema({
  time: Date,
  model: String, // phone OR email
  data: String,
  textSummary: String
});
module.exports = mongoose.model('ContactRecord', contactRecordSchema);