angular.module('crmApp', []).
  controller('agentController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.agents = [];
    $http.get('/api/agents')
      .success(function(data, status, headers, config) {
         $scope.agents = data;
    });
    $scope.createAgent = function() {
      $window.location.href="/agent/create";
    };
  }]).
  controller('createAgentController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.createAgentSubmit = function(agent_name, agent_phone, agent_email) {
      $http.post('/api/agent', {name: agent_name, phone: agent_phone, email: agent_email})
        .success(function(data, status, headers, config) {
	   $window.location.href="/agents";
	});
    };
    $scope.createAgentCancel = function() {
      $window.location.href="/agents";
    };
  }]);

$('.agent_detail').click(function() {
  var agentId = $(this).attr("value");
  location.href='/agent/' + agentId;
});

$("#create_agent_submit").click(function() {
  var agent_name = $("#agent_name").val();
  var agent_phone = $("#agent_phone").val();
  var agent_email = $("#agent_email").val();
  if (agent_name && agent_phone && agent_email){
    $.post(
      '/agent',
      {name: agent_name, phone: agent_phone, email: agent_email},
      function(res) {
        window.location = "/agents";
      }
    ).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#create_agent_cancel").click(function() {
  location.href="/agents";
});

$("#edit_agent").click(function() {
  var agentId = $(this).attr("value");
  location.href= '/agent/' + agentId +'/edit';
});

$("#edit_agent_submit").click(function() {
  var agent_name = $("#agent_name").val();
  var agent_phone = $("#agent_phone").val();
  var agent_email = $("#agent_email").val();
  if (agent_name && agent_phone && agent_email){
    var agentId = $(this).attr("value");
    $.ajax({
      type: 'PUT',
      url: '/agent/' + agentId,
      data: {name: agent_name, phone: agent_phone, email: agent_email},
      success: function(res) {
        location.href = "/agent/" + agentId;
      }
    }).fail(function(res) {
      alert("Error: " + res.getResponseHeader("error"));
    });
  } else {
    alert("Name, phone, email is required");
  }
});

$("#edit_agent_cancel").click(function() {
  var agentId = $(this).attr("value");
  location.href='/agent/' + agentId;
});

$("#back_agents").click(function() {
  location.href='/agents';
});
