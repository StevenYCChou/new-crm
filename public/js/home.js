angular.module('crmHomeApp', []).
  controller('crmHomeController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.managerStartCRM = function() {
    $window.location.href="/crm/agents";
	};
  $scope.agentStartCRM = function(agentId) {
    $window.location.href="/crm/agents/" + agentId;
	};
  $scope.customerStartCRM = function(customerId) {
    $window.location.href="/crm/customers/" + customerId;
	};
}]);

angular.module('ecommHomeApp', [])
  .controller('ecommHomeController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.managerStartEcomm = function() {
    $window.location.href="/ecomm/managers/products";
  };
  $scope.customerStartEcommGuest = function() {
    $window.location.href="/ecomm/customers/products";
  };
  $scope.customerStartEcomm = function() {
    $window.location.href="/ecomm/customers/products";
  };
}]);
