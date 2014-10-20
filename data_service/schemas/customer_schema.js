var mongoose = require('mongoose');
var crmBasicSchemas = require('./basic_schemas.js');
module.exports = new crmBasicSchemas.BasicPersonSchema({
  agent : { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent' 
  }
});