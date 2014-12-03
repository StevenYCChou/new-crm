var util = require('util');
var mongoose = require('mongoose');

/* BasicPersonSchema */
function BasicPersonSchema() {
  mongoose.Schema.apply(this, arguments);

  this.add({
    name: String,
    phone: String,
    email: String,
    location: String,
    created: Date,
    lastUpdated: Date,
  });
}
util.inherits(BasicPersonSchema, mongoose.Schema);

/* BasicRelationshipSchema */
function BasicRelationshipSchema() {
 mongoose.Schema.apply(this, arguments);
  this.add({
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  });
};
util.inherits(BasicRelationshipSchema, mongoose.Schema);

/* BasicSubscrptionSchema */
function BasicSubscriptionSchema() {
  mongoose.Schema.apply(this, arguments);

  this.add({
    agent : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    customer : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    notificationMethods: [String],
    notificationFields: [String],
  });
}
util.inherits(BasicSubscriptionSchema, mongoose.Schema);

/*BasicSubscriptionSchema for AWS SNS SMS Service*/
function BasicAwsSmsSubscriptionSchema() {
  mongoose.Schema.apply(this, arguments);

  this.add({
    agent : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    topicArn: String,
    phone: String,
  });
}
util.inherits(BasicAwsSmsSubscriptionSchema, mongoose.Schema);

exports.BasicPersonSchema = BasicPersonSchema;
exports.BasicRelationshipSchema = BasicRelationshipSchema;
exports.BasicSubscriptionSchema = BasicSubscriptionSchema;
exports.BasicAwsSmsSubscriptionSchema = BasicAwsSmsSubscriptionSchema;
