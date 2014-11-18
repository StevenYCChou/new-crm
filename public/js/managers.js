var managerApp = angular.module('crmManagerApp', []);

managerApp.controller('agentIndexController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $http.get('/api/v1.00/entities/agents')
    .success(function(data, status, headers, config) {
       $scope.agents = data.agents;
  });
  $scope.createAgent = function() {
    $window.location.href="/agents/create";
  };
  $scope.agentDetail = function(id) {
    $window.location.href="/agents/" + id;
  }
}]);

managerApp.controller('agentCreateController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.createAgentSubmit = function(agent_name, agent_phone, agent_email) {
   $http.post('/api/v1.00/entities/agents', {name: agent_name, phone: agent_phone, email: agent_email})
     .success(function(data, status, headers, config) {
       $window.location.href="/agents";
    });
  };
  $scope.createAgentCancel = function() {
    $window.location.href="/agents";
  };
}]);