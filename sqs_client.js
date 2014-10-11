var configs = require('./configs.js');
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({ credentials: configs.creds, region: configs.region});

sqs.getQueueUrl({QueueName: configs.queueName}, function(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    sqs.receiveMessage({QueueUrl: data.QueueUrl}, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data.Messages[0].Body);           // successful response
    });
  };
});