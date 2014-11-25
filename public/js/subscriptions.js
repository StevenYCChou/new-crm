var subscriptionApp = angular.module('crmSubscriptionApp', []);

subscriptionApp.controller('agentSubscriptionsIndexController',['$scope', '$http', '$window',
                                                                function($scope, $http, $window) {
  $http.get('/api/v1.00/entities/agents')
    .success(function(data, status, headers, config) {
       $scope.agents = data.agents;
  });
  $scope.agentSubscriptionDetail = function(id) {
    $window.location.href="/subscriptions/agents/" + id;
  }
}]);

subscriptionApp.controller('agentSubscriptionsController', ['$scope', '$http', '$window', '$location',
                                                            function($scope, $http, $window, $location) {
  $scope.subscriptions = [];
  $scope.agentId = $location.absUrl().split("/")[5];
  $http.get('/api/v1.00/entities/subscriptions?q=agent=' + $scope.agentId)
    .success(function(data, status, headers, config) {
      $scope.subscriptions = data.subscriptions;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.deleteSubscription = function(subscriptionId) {
    $http({
      url: '/api/v1.00/entities/subscriptions/' + subscriptionId,
      method: 'DELETE',
      })
      .success(function(data, status, headers, config) {
        $window.location.href="/subscriptions/agents/" + $scope.agentId;
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
  $scope.updateSubscription = function(subscriptionId) {
    $window.location.href="/subscriptions/agents/" + $scope.agentId + "/subscriptions/" + subscriptionId + "/edit";
  };
  $scope.createNewSubscription = function() {
    $window.location.href="/subscriptions/agents/" + $scope.agentId + "/create";
  };
  $scope.backToAgentList = function() {
    $window.location.href="/subscriptions/agents/";
  };
}]);

subscriptionApp.controller('createSubscriptionController', ['$scope', '$http', '$window', '$location',
                                                        function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[5];

  $scope.customers = [];
  $scope.customer_select = $scope.customers[0];

  $scope.notificationMethods = [
    {name: 'email', selected: false}, 
    {name: 'sms', selected: false},
  ];

  $scope.notificationFields = [
    {name: 'email', selected: false}, 
    {name: 'phone', selected: false},
  ];

  $http.get('/api/v1.00/entities/customers?q=agent=' + $scope.agentId)
    .success(function(data, status, headers, config) {
      $scope.customers = data.customers;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.createSubscriptionSubmit = function() {
    var methods = [];
    $scope.notificationMethods.forEach(function(element) {
      if (element.selected == true)
        methods.push(element.name);
    })
    var fields = [];
    $scope.notificationFields.forEach(function(element) {
      if (element.selected == true)
        fields.push(element.name);
    })
 
    var data = {
      agent: $scope.agentId,
      customer: $scope.customer_select._id,
      notificationMethods: methods,
      notificationFields: fields,
    };
    $http({
      url: '/api/v1.00/entities/subscriptions', 
      method: 'POST', 
      data: data,
    })
    .success(function(data, status, headers, config) {
      $window.location.href="/subscriptions/agents/" + $scope.agentId;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  };
  $scope.createSubscriptionCancel = function() {
    $window.location.href="/subscriptions/agents/" + $scope.agentId;
  };
}]);

subscriptionApp.controller('editSubscriptionController', ['$scope', '$http', '$window', '$location', 
                                                    function($scope, $http, $window, $location) {
  $scope.subscriptionId = $location.absUrl().split("/")[7];
  $scope.agentId = $location.absUrl().split("/")[5];
  $scope.subscription = [];

  $scope.notificationMethods = [];
  $scope.notificationFields = [];

  $http.get('/api/v1.00/entities/subscriptions/'+$scope.subscriptionId)
  .success(function(data, status, headers, config) { 
    $scope.subscription = data.subscription;
    var methods = ['email', 'sms'];
    methods.forEach(function(method) {
      if ($scope.subscription.notificationMethods.indexOf(method) != -1)
        $scope.notificationMethods.push({name: method, selected: true});
      else
        $scope.notificationMethods.push({name: method, selected: false});
    })

    var fields = ['emial', 'phone'];
    fields.forEach(function(field) {
      if ($scope.subscription.notificationFields.indexOf(field) != -1)
        $scope.notificationFields.push({name: field, selected: true});
      else
        $scope.notificationFields.push({name: field, selected: false});
    })
    
  })
  .error(function(data, status, headers, config) {
    $scope.errorStatus = status;
    $scope.errorData = data;
    $window.alert("Status: " + status + ", " + data);
  });
  $scope.editSubscriptionSubmit = function() {
    var methods = [];
    $scope.notificationMethods.forEach(function(element) {
      if (element.selected == true)
        methods.push(element.name);
    })
    var fields = [];
    $scope.notificationFields.forEach(function(element) {
      if (element.selected == true)
        fields.push(element.name);
    })
 
    var data = {
      notificationMethods: methods,
      notificationFields: fields,
    };

    $http({
      url: '/api/v1.00/entities/subscriptions/' + $scope.subscriptionId, 
      method: 'PUT', 
      data: data,
    })         
    .success(function(data, status, headers, config) {
      $window.location.href="/subscriptions/agents/" + $scope.agentId;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  };
  $scope.editSubscriptionCancel = function() {
    $window.location.href="/subscriptions/agents/" + $scope.agentId;
  };
}]);
