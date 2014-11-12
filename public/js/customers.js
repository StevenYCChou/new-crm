angular.module('crmCustomerApp',[]).
  controller('createCustomerController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.createCustomerSubmit = function(customer_name, customer_phone, customer_email) {
    $http.post('/api/agent/' + $scope.agentId, {name: customer_name, phone: customer_phone, email: customer_email})
      .success(function(data, status, headers, config) {
        $window.location.href="/agent/" + $scope.agentId;    
      });
  };
  $scope.createCustomerCancel = function() {
    $window.location.href="/agent/" + $scope.agentId;
  };
  }]).
  controller('customerDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.customerId = $location.absUrl().split("/")[6];
  $http.get('/api/agent/' + $scope.agentId + "/customer/" + $scope.customerId)      .success(function(data, status, headers, config)  {
        $scope.customer = data.customer;
	$scope.contact_historys = data.contact_history;
	$scope.agent = data.agent;
    });
  $scope.editCustomer = function(agentId, customerId) {
    $window.location.href="/agent/" + agentId + "/customer/" + customerId + "/edit";
  }
  $scope.deleteCustomer = function(agentId, customerId) {
    $http.delete('/api/customer/' + customerId)
      .success(function(data, status, headers, config) {
        $window.location.href="/agent/" + agentId;
      });
  }
  $scope.customerBackAgent = function(agentId) {
    $window.location.href="/agent/" + agentId;
  };
  $scope.customerBackAgents = function() {
    $window.location.href="/agents"
  };
  }]).
  controller('customerEditController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agent = [];
  $scope.customer = [];
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.customerId = $location.absUrl().split("/")[6];
    $http.get('/api/agent/' + $scope.agentId + '/customer/' + $scope.customerId)
      .success(function(data, status, headers, config) {
        $scope.agent = data.agent;
        $scope.customer = data.customer;
      });
    $scope.editCustomerSubmit = function(agent_id, customer_id, customer_name, customer_phone, customer_email) {
      $http.put('/api/agent/' + agent_id + + '/customer/' + customer_id, {name: customer_name, phone: customer_phone, email: customer_email})          
        .success(function(data, status, headers, config) {
            $window.location.href="/agent/" + agent_id + "/customer/" + customerId;
        });
      };
    $scope.editCustomerCancel = function(agent_id, customer_id) {
      $window.location.href="/agent/" + agent_id + "/customer/" + customerId;
    };  
  }]);

$("#edit_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var agentId = $(this).attr("value");
    var customerId = $(this).attr("name");
    $.ajax({
      type: 'PUT',
      url: '/agent/' + agentId + '/customer/' + customerId,
      data: {name: customer_name, phone: customer_phone, email: customer_email},
      success: function(res) {
        window.location = '/agent/' + agentId + '/customer/' + customerId;
      }
    }).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#edit_customer_cancel").click(function() {
  var agentId = $(this).attr("value");
  var customerId = $(this).attr("name");
  location.href='/agent/' + agentId + '/customer/' + customerId;
});

$(".customer_delete").click(function() {
  var customerId = $(".customerId").val();
  if (customerId){
    $.post(
      '/customer/:id/delete',
      {customerId: customerId},
      function(res) {
        window.location = "/customers";
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Id is required");
  }
});

$('#customer_view_edit').click(function() {
  var customerId = $(this).attr("value");
  location.href= '/customer/' + customerId + '/edit';
});

$("#customer_view_edit_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var customerId = $(this).attr("value");
    $.post(
      '/customer/' + customerId,
      {name: customer_name, phone: customer_phone, email: customer_email},
      function(res) {
        window.location = '/customer/' + customerId;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#customer_view_edit_customer_cancel").click(function() {
  var customerId = $(this).attr("value");
  location.href= '/customer/' + customerId;
});
