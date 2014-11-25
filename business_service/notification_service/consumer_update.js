var nodemailer = require('nodemailer');
var rabbitmqService = require('./rabbitmq_service');
var mongodbService = require('../../data_service/mongodb_service.js');
var Subscription = mongodbService.Subscription;
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

var render_email_consumer = {
  exchange: 'crm-subscribed-update',
  queue: 'render_email_queue',
  type: 'topic',
  routingKey: 'email.*',
  callback: function(msg, headers, deliveryInfo) {
    console.log("rendering email.");
    renderEmail(msg);
  },
}

var email_to_agent_consumer = {
  exchange: 'crm-rendered-email',
  queue: '',
  type: 'topic',
  routingKey: '',
  callback: function(msg, headers, deliveryInfo) {
    var AWS = require('aws-sdk');
    var configs = require('../../configs.js');
    var crmSES = require('../../crm_aws_module/SES.js');
    console.log(msg);
    crmSES.sendEmail(msg.from, msg.to, msg.cc, msg.subject, msg.message, function(err) {
      console.log("sending email to the agent.");
      if (err) {
        console.log(err);
      } else {
        console.log('Mail is sent.');
      }
    })
  },
};

var render_sms_consumer = {
  exchange: 'crm-subscribed-update',
  queue: 'render_sms_queue',
  type: 'topic',
  routingKey: '*.sms',
  callback: function(msg, headers, deliveryInfo) {
    console.log("rendering email.");
    console.log('Publishing message to the send sms queue.');
    rabbitmqService.publishMessage('crm-rendered-sms', msg, '');
  },
}

var sms_to_agent_consumer = {
  exchange: 'crm-rendered-sms',
  queue: '',
  type: 'topic',
  routingKey: '',
  callback: function(msg, headers, deliveryInfo) {
    console.log("sending sms to the agent.");
  },
};

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
      })
    }
  })
}

function renderEmail (msg) {
  Agent.findById(msg.agentId, function (err, agent) {
    if (err) {
      console.log('err');
    } else {
      console.log('Rendering Email.');
      // from to cc subject body.
      var subject = "[Customer Update] " + msg.originalProfile.name + " " + msg.originalProfile._id;
      var from = 'wx2148@columbia.edu';
      var to = [agent.email];
      var cc = [];
      var message = msg;
      msg = {
        subject: subject,
        from: from,
        to: to,
        cc: cc,
        message: JSON.stringify(message),
      }
      console.log('Publishing message to the send message queue.');
      rabbitmqService.publishMessage('crm-rendered-email', msg, '');
    }
  })
}

exports.startConsumers = function() {
  rabbitmqService.startConsumers([
    update_consumer,
    render_email_consumer,
    render_sms_consumer,
    email_to_agent_consumer,
    sms_to_agent_consumer,
  ]);
};
