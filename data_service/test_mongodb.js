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

Agent = conn.model('Agent');
Customer = conn.model('Customer');
ContactRecord = conn.model('ContactRecord');

// create Agent
var agent_1 = {
  name: 'agent_1',
  phone: '123-456-789',
  email: 'test@test.com',
  location: 'TX',
  created: new Date(),
  lastUpdated: new Date(),
}

var agent_2 = {
  name: 'agent_2',
  phone: '123-456-789',
  email: 'test@test.com',
  location: 'MN',
  created: new Date(),
  lastUpdated: new Date(),
}


Agent.remove({}, function(err, data) {
  if (err) {
    console.log("err");
    return;
  }
  console.log(data);
})

console.log("create agent 1 and agent 2");
Agent.create(agent_1, function(err, data) {
  if (err) {
    console.log('err');
    return;
  }
  console.log(data);
})

Agent.create(agent_2, function(err, data) {
  if (err) {
    console.log('err');
    return;
  }
  console.log(data);
})


console.log("wait for 5 secondes.");
var sleep = require('sleep');
sleep.sleep(5);
console.log("wake up.");

Agent.find({}, function(err, data) {
  if (err) {
    console.log("err");
    return;
  }
  console.log(data);
})
/*
var customerId = '54668ae2807353994e9f5ce6';
var CUSTOMER_UPDATE_AGENT_RECORD_DURATION = 60*60*24*3*1000; // 72 hours
ContactRecord.where('customer').equals(customerId).sort({time: -1}).limit(1).exec(function (err, contactRecords) {
  console.log(contactRecords);
  if (err) {
    console.log(err);
  } else {
    if (contactRecords.length < 1) {
      console.log(null);
    } else {
      var currTime = new Date();
      if (contactRecords[0].time - currTime > CUSTOMER_UPDATE_AGENT_RECORD_DURATION) {
        console.log(null);
      } else {
        console.log(new Error('Unable to assign new agent to the customer'));
      }
    }
  }
});
*/
