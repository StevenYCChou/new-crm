angular.module('crmApp', []).
  controller('agentController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.agents = [];
    $http.get('/api/agents')
      .success(function(data, status, headers, config) {
         $scope.agents = data;
    });
    $scope.createAgent = function() {
      $window.location.href="/agent/create";
    };
    $scope.agentDetail = function(agentId) {
      $window.location.href="/agent/" + agentId;

    }
  }]).
  controller('createAgentController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.createAgentSubmit = function(agent_name, agent_phone, agent_email) {
      $http.post('/api/agent', {name: agent_name, phone: agent_phone, email: agent_email})
        .success(function(data, status, headers, config) {
	   $window.location.href="/agents";
	});
    };
    $scope.createAgentCancel = function() {
      $window.location.href="/agents";
    };
  }]).
  controller('agentDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.agent = [];
    $scope.customers = [];
    $scope.routes = $location.absUrl().split("/")[4];
    $http.get('/api/agent/' + $scope.routes)
      .success(function(data, status, headers, config) {
        $scope.agent = data.agent;
	$scope.customers = data.customers;
      });
    $scope.editAgent = function(agentId) {
      $window.location.href="/agent/" + agentId + "/edit";
    };
    $scope.backAgents = function() {
      $window.location.href="/agents";
    };
    $scope.createCustomer = function(agentId) {
      $window.location.href="/agent/" + agentId + "/create";
    }
  }]).
  controller('agentEditController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.agent = [];
    $scope.routes = $location.absUrl().split("/")[4];
    $http.get('/api/agent/' + $scope.routes)
      .success(function(data, status, headers, config) {
        $scope.agent = data.agent;
      });
    $scope.editAgentSubmit = function(agent_id, agent_name, agent_phone, agent_email) {
      $http.put('/api/agent/' + agent_id, {name: agent_name, phone: agent_phone, email: agent_email})          
      .success(function(data, status, headers, config) {
          $window.location.href="/agent/" + agent_id;
         });
       };
    $scope.editAgentCancel = function(agent_id) {
      $window.location.href="/agent/" + agent_id;
    };  
  }]);
