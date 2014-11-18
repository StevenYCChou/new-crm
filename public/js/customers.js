var customerApp = angular.module('crmCustomerApp',[]);
customerApp.controller('showDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/customers/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.customer;
      $http.get('/api/v1.00/entities/agents/' + $scope.customer.agent)
        .success(function(data, status, headers, config) {
          $scope.agent = data.agent;
          $http.get('/api/v1.00/entities/contact_records?q=customer=' + $scope.customerId + ',agent=' + $scope.agent._id)
            .success(function(data, status, headers, config) {
              $scope.contact_records = data.contact_records;
          });
      });
  });
  $scope.customerViewEdit = function(customerId) {
    $window.location.href = "/customers/" + customerId + "/edit";
  };
}]);

customerApp.controller('editDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/customers/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.customer;
    });
  $scope.editCustomerSubmit = function(customerId, name, phone, email) {
    $http.put('/api/v1.00/entities/customers/' + $scope.customerId, {name: name, phone: phone, email: email})
      .success(function(data, status, headers, config) {
      $window.location.href="/customers/" + customerId;
    });
  };
  $scope.returnToCustomer = function(customerId) {
    $window.location.href = "/customers/" + customerId;
  };
}]);
