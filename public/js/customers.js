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
  }]);

$('.customer_detail').click(function() {
  var customerId = $(this).attr("value");
  var agentId = $(this).attr("name");
  location.href='/agent/' + agentId + '/customer/' + customerId;
});

$("#create_customer_submit").click(function() {
  var customer_name = $("#customer_name").val();
  var customer_phone = $("#customer_phone").val();
  var customer_email = $("#customer_email").val();
  if (customer_name && customer_phone && customer_email){
    var agentId = $(this).attr("value");
    $.post('/agent/' + agentId,
      { name: customer_name,
        phone: customer_phone,
        email: customer_email,
        agentId: agentId },
      function(res) {
        location.href = "/agent/"+ agentId;
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#create_customer_cancel").click(function() {
  var agentId = $(this).attr("value");
  location.href='/agent/' + agentId;
});

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

$("#edit_customer").click(function() {
  var agentId = $(this).attr("value");
  var customerId = $(this).attr("name");
  location.href='/agent/' + agentId + '/customer/' + customerId + '/edit';
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

$("#customer_back_agent").click(function() {
  var agentId = $(this).attr("value");
  location.href= '/agent/' + agentId;
});

$("#customer_back_agents").click(function() {
  location.href= '/agents';
});

$("#customer_delete").click(function() {
  var agentId = $(this).attr("value");
  var customerId = $(this).attr("name");
  $.ajax({
    type: 'delete',
    data: {agentid: agentId, customerid: customerId},
    url: '/customer/' + customerId,
    success: function(res) {
      window.location="/agent/" + agentId;
    }
  })
  .fail(function(res) {
    alert("Error: " + res.getResponseHeader("error"));
  });
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
