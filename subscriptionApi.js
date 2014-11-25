var mongodbService = require('./data_service/mongodb_service.js');
var Promise = require('promise');
var Qs = require('qs');

var validSubscriptionQueryField = {
  agent: undefined,
  customer: undefined,
  notificationMethods: undefined,
  notificationFields: undefined,
};

var filter = function(obj, predicate) {
  var result = {}, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key) && predicate(key)) {
          result[key] = obj[key];
      }
  }
  return result;
};

exports.getSubscriptions = function (req, res) {
  var offset = req.query.offset;
  var limit = req.query.limit;

  var q = req.query.q;
  var query = Qs.parse(q, { delimiter: ',' });
  var filteredQuery = filter(query, function(key) {return key in validSubscriptionQueryField;});
  // var name_q = new RegExp(req.param('name'));

  var promise = mongodbService.Subscription.find(filteredQuery, {__v: 0})
                                    .skip(offset)
                                    .limit(limit)
                                    .populate('customer')
                                    .exec();
  promise.then(function(subscriptions) {
    res.json({
      _type: "subscription",
      subscriptions: subscriptions,
    });
  }, function(err) {
    res.json({error: err});
  });
};

exports.getSubscription = function (req, res) {
  var id = req.params.id;

  var promise = mongodbService.Subscription.findOne({_id: id}, {__v: 0}).populate('customer').exec();
  promise.then(function(subscription) {
    subscription = subscription.toJSON();
    res.json({
      _type: "subscription",
      subscription: subscription
    });
  }, function(err) {
    res.json({error: err});
  });
}


exports.removeSubscription = function (req, res) {
  var subscriptionId = req.param('id');
  mongodbService.Subscription.findByIdAndRemove(subscriptionId, function (err, subscription) {
    if (err) {
      res.json({error: err});
    } else {
      res.json({code: 202});
    }
  });
}

exports.createSubscription = function (req, res) {
  var newSubscription= {
    agent: req.param('agent'),
    customer: req.param('customer'),
    notificationMethods: req.param('notificationMethods'),
    notificationFields: req.param('notificationFields'),
  };
  mongodbService.Subscription.create(newSubscription, function (err, subscription) {
    if (err) {
      res.json({error: err});
    } else {
      res.json({code: 202});
    }
  });
};

exports.updateSubscription = function (req, res) {
  var subscriptionId = req.param('id');
  var updateInfo = {
    notificationMethods: req.param('notificationMethods'),
    notificationFields: req.param('notificationFields'),
  };
  mongodbService.Subscription.findByIdAndUpdate(subscriptionId, updateInfo)
                             .exec(function (err, subscripation) {
    if (err) {
      res.json({error: err});
    } else {
      res.json({code: 202});
    }
  });
}
