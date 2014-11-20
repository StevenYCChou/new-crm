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
    createdAt: { type: Date, default: Date.now()},
    lastUpdatedAt: { type: Date, default: Date.now()},
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

exports.BasicPersonSchema = BasicPersonSchema;
exports.BasicRelationshipSchema = BasicRelationshipSchema;
