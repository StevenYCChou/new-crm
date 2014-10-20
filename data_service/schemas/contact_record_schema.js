var mongoose = require('mongoose');
var crmBasicSchemas = require('./basic_schemas.js');
module.exports = new crmBasicSchemas.BasicRelationshipSchema({
  time: Date,
  model: String, // phone OR email
  data: String,
  textSummary: String
});