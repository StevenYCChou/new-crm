angular.module('crmHomeApp', []).
  controller('homeController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.managerStartCRM = function() {
    $window.location.href="/agents";
	};
  $scope.customerStartCRM = function(customerId) {
    $window.location.href="/customers/" + customerId;
	};
}]);
