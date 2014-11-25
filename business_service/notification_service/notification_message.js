function createUpdateMessage(agentId, customerId, originalProfile, newProfile) {
  var updatedFields = findDiff(originalProfile, newProfile);
  var message = {
    agentId: agentId, // String
    customerId: customerId, // String
    updatedFields: updatedFields, // Array
    originalProfile: originalProfile, // JSON
    newProfile: newProfile, // JSON
  };

  return message;

  function findDiff(originalProfile, newProfile) {
    var updatedFields = [];
    var keys = ["name", "phone", "email", "location"]
    keys.forEach(function(key) {
      if (originalProfile[key] != newProfile[key]) {
        updatedFields.push(key);
      }
    })
    return updatedFields;
  }
}

exports.createUpdateMessage = createUpdateMessage;

