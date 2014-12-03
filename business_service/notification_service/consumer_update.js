var AWS = require('aws-sdk');
var configs = require('../../configs.js');
var crmSES = require('../../crm_aws_module/SES.js');
var crmSNS = require('../../crm_aws_module/SNS.js');
var rabbitmqService = require('./rabbitmq_service');
var mongodbService = require('../../data_service/mongodb_service.js');
var Subscription = mongodbService.Subscription;
var AwsSmsSubscription = mongodbService.AwsSmsSubscription;
var Agent = mongodbService.Agent;

var update_consumer = {
  exchange: 'crm-notification-consumer-update',
  queue: 'update_queue',
  type: 'topic',
  routingKey: '',
  callback: function(msg, headers, deliveryInfo) {
    console.log('Received update message.');
    filterMessage(msg);
  },
};

var email_to_agent_consumer = {
  exchange: 'crm-subscribed-update',
  queue: 'render_email_queue',
  type: 'topic',
  routingKey: 'email.*',
  callback: function(msg, headers, deliveryInfo) {
    renderAndSendEmailToAgent(msg);
  },
}

var sms_to_agent_consumer = {
  exchange: 'crm-subscribed-update',
  queue: 'render_sms_queue',
  type: 'topic',
  routingKey: '*.sms',
  callback: function(msg, headers, deliveryInfo) {
    renderAndSendSmsToAgent (msg);
  },
}

function filterMessage(msg) {
  var target = {
    agent: msg.agentId,
    customer: msg.customerId,
  }

  Subscription.find({ agent: msg.agentId, customer: msg.customerId }, function(err, subscriptions) {
    if (err) {
      console.log(err);
    } else {
      subscriptions.forEach(function(subscription) {
        console.log("Publishing message to the email/sms queue");
        var updatedFields = msg.updatedFields;
        for (i = 0; i < subscription.notificationFields.length; i++) {
          if (updatedFields.indexOf(subscription.notificationFields[i]) != -1) {
            var topic = "";
            if (subscription.notificationMethods.length == 1) {
              if (subscription.notificationMethods[0] == 'email') topic = 'email.';
              if (subscription.notificationMethods[0] == 'sms') topic = '.sms';
            }
            if (subscription.notificationMethods.length == 2) {
              topic = 'email.sms';
            }
            rabbitmqService.publishMessage('crm-subscribed-update', msg, topic);
            break;
          }
        }
      });
    }
  });
}

function renderAndSendEmailToAgent(msg) {
  Agent.findById(msg.agentId, function (err, agent) {
    if (err) {
      console.log(err);
    } else {
      console.log('Rendering Email.');
      // from to cc subject body.
      var subject = "[CRM Notification Center] Your customer " + msg.originalProfile.name + " updated his/her " + msg.updatedFields;
      var from = 'wx2148@columbia.edu';
      var to = [agent.email];
      var cc = [];
      var message = [
        'Customer: ' + msg.newProfile.name,
        'Updated Fields: ' + msg.updatedFields,
        'Current profile: phone: ' + msg.newProfile.phone + ', email: ' + msg.newProfile.email,
      ].join('\n');

      console.log('Sending email to the agent.');
      crmSES.sendEmail(from, to, cc, subject, message, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Mail is sent.');
        }
      })
    }
  })
}

function renderAndSendSmsToAgent(msg) {

 var message = 'Your Customer ' + msg.newProfile.name + ' updated his/her ' + msg.updatedFields + '. Please check on CRM website. [CRM Notification Center]';

  Agent.findById(msg.agentId, function (err, agent) {
    if (err) {
      console.log(err);
    } else {
      AwsSmsSubscription.findOne({agent: agent._id}, function (err, subscription) {
        if (err) {
          console.log(err);
        } else {
          console.log("Sending sms to the agent.");
          crmSNS.sendSMS(subscription.topicArn, message, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log('SMS is sent.');
            }
          });
        }
      })
    }
  });
}

exports.startConsumers = function() {
  rabbitmqService.startConsumers([
    update_consumer,
    email_to_agent_consumer,
    sms_to_agent_consumer,
  ]);
};
