angular.module('crmContactHistoryApp',[]).
  controller('createContactHistoryController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4].split("?")[1].split("=")[1].split("&")[0];
  $scope.customerId = $location.absUrl().split("/")[4].split("?")[1].split("=")[2];
  $scope.models = [
    {name: 'phone'},
    {name: 'email'}
  ];
  $scope.model_select = $scope.models[0];
  $scope.createContactCancel = function() {
    $window.location.href="/agent/" + $scope.agentId + "/customer/" + $scope.customerId;
  };
  $scope.createContactSubmit = function(textSummary, model_select, time, data) {
    $http.post('/api/contact_history', {textSummary: textSummary, model: model_select, time: time, data: data, agentId: $scope.agentId, customerId: $scope.customerId})
    .success(function(data, status, headers, config) {
      $window.location.href="/agent/" + $scope.agentId + "/customer/" + $scope.customerId;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  };
  }]).
  controller('contactDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.contactId = $location.absUrl().split("/")[4];
  $http.get('/api/contact_history/' + $scope.contactId)
    .success(function(data, status, headers, config){
      $scope.contact_history = data.contact_history;
      $scope.agentId = data.agentId;
      $scope.customerId = data.customerId;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.contactHistoryBackCustomer = function(agentId, customerId) {
    $window.location.href="/agent/" + agentId + "/customer/" + customerId;
  };
  $scope.contactHistoryBackAgent = function(agentId) {
    $window.location.href = "/agent/" + agentId;
  };
  $scope.contactHistoryBackAgents = function() {
    $window.location.href = "/agents";
  };
  }]);

$(function() {
  $( "#time" ).datepicker();
});

