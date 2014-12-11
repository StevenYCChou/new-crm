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

angular.module('ecommHomeApp', []).
  controller('ecommHomeController', ['$scope', '$http', '$window', function($scope, $http, $window) {
}]);
