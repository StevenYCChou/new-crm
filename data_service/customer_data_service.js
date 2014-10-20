var mongoose = require('mongoose');
var crmBasicSchemas = require('./crm_basic_schemas.js');
var customerSchema = new crmBasicSchemas.BasicPersonSchema({
  agent : { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent' 
  }
});
module.exports = mongoose.model('Customer', customerSchema);