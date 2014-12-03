var crmSNS = require('../crm_aws_module/SNS.js');
var mongodbService = require('../data_service/mongodb_service.js');
var Agent = mongodbService.Agent;
var AwsSmsSubscription = mongodbService.AwsSmsSubscription;

exports.showAllAgents = function (req, res) {
  res.render('subscription/index');
}

exports.showAgentSubscriptions = function (req, res) {
  var agentId = req.param('agentId');
  AwsSmsSubscription.findOne({agent: agentId}, function(err, result) {
    if (err) {
      console.log(err);
    } else if (!result) {
      crmSNS.createTopic('crm_agent_notification_' + agentId, function(err, topicData) {
        if (err) {
          console.log(err, err.stack);
        } else {
          crmSNS.setTopicDisplayName(topicData.TopicArn, 'CRM', function(err, setData) {
            Agent.findById(agentId, function(err, agent) {
              if (err) {
                console.log(err, err.stack);
              } else {
                crmSNS.subscribe(topicData.TopicArn, agent.phone, function(err, subscribeData) {
                  if (err) {
                    console.log(err, err.stack);
                  } else {
                    console.log("Subscribed SMS service. Waiting for agent confirmation.");
                    var subscription = {
                      agent: agentId,
                      topicArn: topicData.TopicArn,
                      subscriptionArn: subscribeData.SubscriptionArn,
                      phone: agent.phone,
                    }
                    AwsSmsSubscription.create(subscription, function(err, result) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(result);
                      }
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  });
  res.render('subscription/retrieve');
};

exports.showSubscriptionCreationPage = function (req, res) {
  res.render('subscription/create');
};

exports.showSubscriptionUpdatePage = function (req, res) {
  res.render('subscription/update');
};
