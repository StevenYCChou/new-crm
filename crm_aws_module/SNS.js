var AWS = require('aws-sdk');
var configs = require('../configs.js');
var sns = new AWS.SNS({credentials: configs.awsSqs.creds, region: 'us-east-1'});

function publish(message) {
  var params = {
    TopicArn: configs.awsSns.reqQueueTopic,
    Message: message,
  };

  sns.publish(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function createTopic(topic, callback) {
  console.log(topic);
  var params = {
    Name: topic,
  };
  sns.createTopic(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function setTopicDisplayName(topicArn, displayName, callback) {
  var params = {
    AttributeName: 'DisplayName',
    TopicArn: topicArn,
    AttributeValue: displayName,
  };
  sns.setTopicAttributes(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function subscribe(topicArn, endpoint, callback) {
  var params = {
    Protocol: 'sms',
    TopicArn: topicArn,
    Endpoint: endpoint,
  };
  sns.subscribe(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function unsubscribe(subscriptionArn) {
  var params = {
    SubscriptionArn: subscriptionArn,
  }
  sns.unsubscribe(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function sendSMS(topicArn, message, callback) {
  var params = {
    TopicArn: topicArn,
    Message: message,
  };

  sns.publish(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

exports.publish = publish;
exports.createTopic = createTopic;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.setTopicDisplayName = setTopicDisplayName;
exports.sendSMS = sendSMS;
