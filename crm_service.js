var model = require('./model.js');

exports.addAgent = function (newAgent) {
  models['Agent'].create(newAgent, function(err, agentCreated) {
    if (err) {
      return err;
    }
  });
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
