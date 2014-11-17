angular.module('crmAgentApp', []).
  controller('agentController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.agents = [];
    $http.get('/api/v1.00/entities/agents?all=true')
      .success(function(data, status, headers, config) {
         $scope.agents = data.agents;
    });
    $scope.createAgent = function() {
      $window.location.href="/agents/create";
    };
    $scope.agentDetail = function(agentId) {
      $window.location.href="/agents/" + agentId;
    }
  }]).
  controller('createAgentController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.createAgentSubmit = function(agent_name, agent_phone, agent_email) {
      $http.post('/api/v1.00/entities/agents', {name: agent_name, phone: agent_phone, email: agent_email})
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
    $http.get('/api/v1.00/entities/agents/' + $scope.routes)
      .success(function(data, status, headers, config) {
        $scope.agent = data.agent;
        // $scope.customers = data.customers;
      });
    $http.get('/api/v1.00/entities/customers?q=agent=' + $scope.routes)
      .success(function(data, status, headers, config) {
        $scope.customers = data.customers;
      });
    $scope.editAgent = function(agentId) {
      $window.location.href="/agents/" + agentId + "/edit";
    };
    $scope.backAgents = function() {
      $window.location.href="/agents";
    };
    $scope.createCustomer = function(agentId) {
      $window.location.href="/agents/" + agentId + "/create";
    };
    $scope.customerDetail = function(agentId, customerId) {
      $window.location.href="/agents/" + agentId + "/customer/" + customerId;
    }
  }]).
  controller('agentEditController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.agent = [];
    $scope.routes = $location.absUrl().split("/")[4];
    $http.get('/api/v1.00/entities/agents/' + $scope.routes)
      .success(function(data, status, headers, config) {
        $scope.agent = data.agent;
      });
    $scope.editAgentSubmit = function(agent_id, agent_name, agent_phone, agent_email) {
      $http.put('/api/v1.00/entities/agents/' + agent_id, {name: agent_name, phone: agent_phone, email: agent_email})
      .success(function(data, status, headers, config) {
          $window.location.href="/agents/" + agent_id;
         });
       };
    $scope.editAgentCancel = function(agent_id) {
      $window.location.href="/agents/" + agent_id;
    };  
  }]);
