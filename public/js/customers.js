var customerApp = angular.module('crmCustomerApp',[]);
customerApp.controller('showDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/customers/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.data;
      $http.get('/api/v1.00/entities/agents/' + $scope.customer.agent)
        .success(function(data, status, headers, config) {
          $scope.agent = data.data;
          $http.get('/api/v1.00/entities/contact_records?q=customer=' + $scope.customerId + ',agent=' + $scope.agent._id)
            .success(function(data, status, headers, config) {
              $scope.contact_records = data.data;
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
      $scope.customer = data.data;
    });
  $scope.editCustomerSubmit = function(customerId, name, phone, email, location) {
    $http.put('/api/v1.00/entities/customers/' + $scope.customerId, {name: name, phone: phone, email: email, location: location})
      .success(function(data, status, headers, config) {
      $window.location.href="/customers/" + customerId;
    });
  };
  $scope.returnToCustomer = function(customerId) {
    $window.location.href = "/customers/" + customerId;
  };
}]);
