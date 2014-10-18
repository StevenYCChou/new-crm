// Import queueUrl from configuration
var AWS = require('aws-sdk');
var configs = require('../configs.js');
var sqs = new AWS.SQS({ credentials: configs.awsSqs.creds, region: configs.awsSqs.region });

var sendMessage = function sendMessage(queue, message) {

	sqs.getQueueUrl( {QueueName: queue}, function(err, data) {

    if (err) {
      console.log(err, err.stack);
      return;
    }

    if (data.QueueUrl) {
   		sqs.sendMessage({ QueueUrl: data.QueueUrl, MessageBody: message }, function(err, data) {

      	if (err) {
        	console.log(err);
      	}
      });
    }
	});
};

var receiveMessage = function receiveMessage(queue, processor) {

  sqs.getQueueUrl( {QueueName: queue}, function(err, data) {
    var url = data.QueueUrl;

    if (err) {
      console.log(err, err.stack);
      return;
    }

    if (url) {
      sqs.receiveMessage({ QueueUrl: data.QueueUrl, }, function(err, data) {

        if (data.Messages) {

          data.Messages.forEach(function(item) {

            processor(item.Body);
          });

          console.log('Got a message from the Queue!');
          // then delete them (need to convert into params object first)
          var toDelete = [];
          data.Messages.forEach(function(item) {
              toDelete.push( { Id: item.MessageId, ReceiptHandle: item.ReceiptHandle} );
          });

          if (toDelete.length > 0) {
            console.log('Deleting message from Queue...');

            sqs.deleteMessageBatch({ QueueUrl: url, Entries: toDelete }, function(err, data) {
              if (err) {
                console.log(err, err.stack);
              } else {
                console.log(data);
              }
            });
          }
        }
      });
    }
	})
};

exports.sendMessage = sendMessage;
exports.receiveMessage = receiveMessage;
