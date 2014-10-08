var AWS = require('aws-sdk');

var creds = new AWS.SharedIniFileCredentials({ profile: '~/.aws/credentials' });
var sqs_client = new AWS.SQS({ credentials: creds });

sqs_client.