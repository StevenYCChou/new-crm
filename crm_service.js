var model = require('./model.js');

exports.addAgent = function (newAgent, callback) {
  models['Agent'].create(newAgent, callback);
};

// function retrieveAgentById(agentId, err, agent) {
//   models['Agent'].find({})
//                  .where('id')
//                  .equals(agentId)
//                  .exec(function(err, agent) {
//   if(err) {
//     console.log(err);
//   } else {
//     return agent;
//   }
//   });
// };

// function getAllAgents(err) {

// }

// function removeAgentById(agentId) {

// };

// function addContactHistory(agentId, customerId, contact) {

// };
