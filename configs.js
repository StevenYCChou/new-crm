var AWS = require('aws-sdk');
module.exports = new function() {
  return {
    creds: new AWS.SharedIniFileCredentials(),
    region: 'us-east-1',
    queueName:'crm-requests'
  };
}