var AWS = require('aws-sdk');
var sns = new AWS.SNS();
var configs = require('../configs.js');
var sns = new AWS.SNS({ credentials: configs.awsSqs.creds, region: configs.awsSqs.region });


var publish = function snsPublish(message) {

  params = {
    TopicArn: configs.awsSns.reqQueueTopic,
    Message: message,
  };

  sns.publish(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log('Published a SNS.');
    }
  });
};

exports.publish = publish;
