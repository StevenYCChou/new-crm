var AWS = require('aws-sdk');
module.exports = new function() {
  return {
    creds: new AWS.SharedIniFileCredentials(),
    region: 'us-west-2',
    reqQueue:'crm-req',
    resQueue:'crm-res'
  };
}

