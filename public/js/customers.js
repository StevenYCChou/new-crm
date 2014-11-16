angular.module('crmCustomerApp',[]).
  controller('createCustomerController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.createCustomerSubmit = function(customer_name, customer_phone, customer_email) {
    $http.post('/api/agent/' + $scope.agentId, {name: customer_name, phone: customer_phone, email: customer_email})
      .success(function(data, status, headers, config) {
        $window.location.href="/agent/" + $scope.agentId;    
      });
  };
  $scope.createCustomerCancel = function() {
    $window.location.href="/agent/" + $scope.agentId;
  };
  }]).
  controller('customerDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.customerId = $location.absUrl().split("/")[6];
  $http.get('/api/agent/' + $scope.agentId + "/customer/" + $scope.customerId)      .success(function(data, status, headers, config)  {
        $scope.customer = data.customer;
	$scope.contact_historys = data.contact_history;
	$scope.agent = data.agent;
    });
  $scope.editCustomer = function(agentId, customerId) {
    $window.location.href="/agent/" + agentId + "/customer/" + customerId + "/edit";
  }
  $scope.deleteCustomer = function(agentId, customerId) {
    $http.delete('/api/customer/' + customerId)
      .success(function(data, status, headers, config) {
        $window.location.href="/agent/" + agentId;
      });
  };
  $scope.createContactHistory = function(agentId, customerId) {
    $window.location.href="/contact_history/create?agentId=" + agentId + "&customerId=" + customerId;
  };
  $scope.contactHistoryDetail = function(contactHistoryId) {
    $window.location.href="/contact_history/" + contactHistoryId;
  };
  $scope.customerBackAgent = function(agentId) {
    $window.location.href="/agent/" + agentId;
  };
  $scope.customerBackAgents = function() {
    $window.location.href="/agents"
  };
  }]).
  controller('customerDetailCustomerViewController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[4];
  $http.get('/api/customer/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.customer;
      $scope.agent = data.agent;
      $scope.contact_history = data.contact_history;
    });
  $scope.customerViewEdit = function(customerId) {
    $window.location.href = "/customer/" + customerId + "/edit";
  };
  }]).
  controller('customerEditController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agent = [];
  $scope.customer = [];
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.customerId = $location.absUrl().split("/")[6];
  $http.get('/api/agent/' + $scope.agentId + '/customer/' + $scope.customerId)
    .success(function(data, status, headers, config) { 
    $scope.agent = data.agent;
    $scope.customer = data.customer;
  });
  $scope.editCustomerSubmit = function(agent_id, customer_id, customer_name, customer_phone, customer_email) {
    $http.put('/api/agent/' + agent_id + '/customer/' + customer_id, {name: customer_name, phone: customer_phone, email: customer_email})          
      .success(function(data, status, headers, config) {
         $window.location.href="/agent/" + agent_id + "/customer/" + customer_id;
      });
    };
  $scope.editCustomerCancel = function(agent_id, customer_id) {
      $window.location.href="/agent/" + agent_id + "/customer/" + customer_id;
    };  
  }]).
  controller('customerEditCustomerViewController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[4];
  $http.get('/api/customer/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.customer;
    });
  $scope.customerViewEditCustomerSubmit = function(customerId, name, phone, email) {
    $http.post('/api/customer/' + $scope.customerId, {name: name, phone: phone, email: email})
      .success(function(data, status, headers, config) {
        $window.location.href="/customer/" + $scope.customerId;
      });
  };
  $scope.customerViewEditCustomerCancel = function(customerId) {
    $window.location.href = "/customer/" + customerId;
  };
  }]);
