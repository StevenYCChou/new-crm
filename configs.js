var AWS = require('aws-sdk');
module.exports = new function() {
  return {
    awsSqs: {
      creds: new AWS.SharedIniFileCredentials(),
      region: 'us-west-2',
      reqQueue:'crm-req',
      resQueue:'crm-res'
    },

    awsSns: {
      creds: new AWS.SharedIniFileCredentials(),
      region: 'us-west-2',
      reqQueueTopic: 'arn:aws:sns:us-west-2:308426674213:crm_req_queue', 
    },

    mongoDb: {
      server_address: 'mongodb://localhost',
      db_name: 'mydb'
    },

    simpleDb: {
      creds: new AWS.SharedIniFileCredentials(),
      region: 'us-west-2',
    },

    dynamoDb: {
      creds: new AWS.SharedIniFileCredentials(),
      region: 'us-west-2',
    },

    s3: {
      creds: new AWS.SharedIniFileCredentials(),
      region: 'us-west-2',
    }
  };
}

