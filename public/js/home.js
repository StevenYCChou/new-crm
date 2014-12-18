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
  $scope.customerStartEcomm = function(customer_id) {
    $http({
      url: '/api/v1.00/entities/sessions/',
      method: 'PUT',
      data: {userId: customer_id}
    })
    .success(function(data, status, headers, config) {
      $http({
        url: '/api/v1.00/actions/import_view_stats',
        method: 'PUT',
        data: {userId: customer_id}
      })
      .success(function(data, status, headers, config) {
        $window.location.href="/ecomm/customers/products";
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  };
}]);
