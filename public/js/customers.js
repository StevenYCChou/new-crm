var customerApp = angular.module('crmCustomerApp',[]);

customerApp.factory('uuid2', [
  function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16).substring(1);
    };
    return {
      newuuid: function() {
      // http://www.ietf.org/rfc/rfc4122.txt
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      return s.join("");
      },
      newguid: function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
      }
    }
  }
]);

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
  })
  .error(function(data, status, headers, config) {
    $scope.errorStatus = status;
    $scope.errorData = data;
    $window.alert("Status: " + status + ", " + data);
  });
  $scope.customerViewEdit = function(customerId) {
    $window.location.href = "/customers/" + customerId + "/edit";
  };
}]);

customerApp.controller('editDetailController', ['$scope', '$http', '$window', '$location', 'uuid2', function($scope, $http, $window, $location, uuid2) {
  $scope.uuid = uuid2.newuuid();
  $scope.customerId = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/customers/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.customer;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.editCustomerSubmit = function(customerId, name, phone, email) {
    var data = {name: name, phone: phone, email: email};
    $http({
      url: '/api/v1.00/entities/customers/' + $scope.customerId, 
      method: 'PUT', 
      headers: {'nonce' : 'PUT' + JSON.stringify(data) + $scope.uuid},
      data: data}) 
      .success(function(data, status, headers, config) {
        $window.location.href="/customers/" + customerId;
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
  $scope.returnToCustomer = function(customerId) {
    $window.location.href = "/customers/" + customerId;
  };
}]);
