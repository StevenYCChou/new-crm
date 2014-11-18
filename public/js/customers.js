var customerApp = angular.module('crmCustomerApp',[]);
customerApp.controller('showDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
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
  }]);

controller('editDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
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
