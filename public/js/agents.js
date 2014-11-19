var agentApp = angular.module('crmAgentApp', []);

agentApp.factory('uuid2', [
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

agentApp.controller('showDetailController', ['$scope', '$http', '$window', '$location',
                                             function($scope, $http, $window, $location) {
  $scope.agent = [];
  $scope.customers = [];
  $scope.routes = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/agents/' + $scope.routes)
    .success(function(data, status, headers, config) {
      $scope.agent = data.agent;
    });
  $http.get('/api/v1.00/entities/customers?q=agent=' + $scope.routes)
    .success(function(data, status, headers, config) {
      $scope.customers = data.customers;
    });
  $scope.editAgent = function(agentId) {
    $window.location.href="/agents/" + agentId + "/edit";
  };
  $scope.backToAgentList = function() {
    $window.location.href="/agents";
  };
  $scope.createCustomer = function(agentId) {
    $window.location.href="/agents/" + agentId + "/create";
  };
  $scope.customerDetail = function(agentId, customerId) {
    $window.location.href="/agents/" + agentId + "/customers/" + customerId;
  }
}]);

agentApp.controller('updateDetailController', ['$scope', '$http', '$window', '$location', 'uuid2',
                                               function($scope, $http, $window, $location, uuid2) {
  $scope.uuid = uuid2.newuuid();
  $scope.agent = [];
  $scope.routes = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/agents/' + $scope.routes)
    .success(function(data, status, headers, config) {
      $scope.agent = data.agent;
    });
  $scope.editAgentSubmit = function(agent_id, agent_name, agent_phone, agent_email) {
    var data ={name: agent_name, phone: agent_phone, email: agent_email};
    $http({
      url: '/api/v1.00/entities/agents/' + agent_id,
      method: 'PUT',
      headers: {'nonce' : 'PUT' + JSON.stringify(data) + $scope.uuid},
      data: data})
    .success(function(data, status, headers, config) {
        $window.location.href="/agents/" + agent_id;
       });
     };
  $scope.editAgentCancel = function(agent_id) {
    $window.location.href="/agents/" + agent_id;
  };
}]);

agentApp.controller('createCustomerController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.createCustomerSubmit = function(customer_name, customer_phone, customer_email) {
    $http.post('/api/v1.00/entities/customers', {name: customer_name, phone: customer_phone, email: customer_email, agentId: $scope.agentId})
      .success(function(data, status, headers, config) {
        $window.location.href="/agents/" + $scope.agentId;
      });
  };
  $scope.createCustomerCancel = function() {
    $window.location.href="/agents/" + $scope.agentId;
  };
}]);

agentApp.controller('showCustomerDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.customerId = $location.absUrl().split("/")[6];
  $http.get('/api/v1.00/entities/agents/'+$scope.agentId)
    .success(function(data, status, headers, config) {
      $scope.agent = data.agent;
    });
  $http.get('/api/v1.00/entities/customers/'+$scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.customer;
    });
  $http.get('/api/v1.00/entities/contact_records?q=agent='+$scope.agentId+',customer='+$scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.contact_records = data.contact_records;
    });
  $scope.editCustomer = function(agentId, customerId) {
    $window.location.href="/agents/" + agentId + "/customers/" + customerId + "/edit";
  }
  $scope.deleteCustomer = function(agentId, customerId) {
    $http.delete('/api/v1.00/entities/customers/' + customerId)
      .success(function(data, status, headers, config) {
        $window.location.href="/agents/" + agentId;
      });
  };
  $scope.createContactRecord = function(agentId, customerId) {
    $window.location.href="/contact_history/create?agentId=" + agentId + "&customerId=" + customerId;
  };
  $scope.contactRecordDetail = function(contactRecordId) {
    $window.location.href="/contact_history/" + contactRecordId;
  };
  $scope.backToAgent = function(agentId) {
    $window.location.href="/agents/" + agentId;
  };
  $scope.backToAgentList = function() {
    $window.location.href="/agents";
  };
}]);

agentApp.controller('editCustomerDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agent = [];
  $scope.customer = [];
  $scope.agentId = $location.absUrl().split("/")[4];
  $scope.customerId = $location.absUrl().split("/")[6];
  $http.get('/api/v1.00/entities/customers/'+$scope.customerId)
    .success(function(data, status, headers, config) { 
    $scope.customer = data.customer;
  });
  $scope.editCustomerSubmit = function(agent_id, customer_id, customer_name, customer_phone, customer_email) {
    $http.put('/api/v1.00/entities/customers/' + $scope.customerId, {agent: $scope.agentId , name: customer_name, phone: customer_phone, email: customer_email})          
      .success(function(data, status, headers, config) {
         $window.location.href="/agents/" + $scope.agentId + "/customers/" + $scope.customerId;
      });
    };
  $scope.editCustomerCancel = function(agent_id, customer_id) {
    $window.location.href="/agents/" + $scope.agentId + "/customers/" + $scope.customer_id;
  };
}]);

agentApp.controller('createContactRecordController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.agentId = $location.absUrl().split("/")[4].split("?")[1].split("=")[1].split("&")[0];
  $scope.customerId = $location.absUrl().split("/")[4].split("?")[1].split("=")[2];
  $scope.models = [
    {name: 'phone'},
    {name: 'email'}
  ];
  $scope.model_select = $scope.models[0];
  $scope.createContactCancel = function() {
    $window.location.href="/agents/" + $scope.agentId + "/customers/" + $scope.customerId;
  };
  $scope.createContactSubmit = function(textSummary, model_select, time, data) {
    $http.post('/api/v1.00/entities/contact_records', {textSummary: textSummary, model: model_select, time: time, data: data, agentId: $scope.agentId, customerId: $scope.customerId})
    .success(function(data, status, headers, config) {
      $window.location.href="/agents/" + $scope.agentId + "/customers/" + $scope.customerId;
    });
  };
}]);

agentApp.controller('showContactRecordController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.contactId = $location.absUrl().split("/")[4];
  $http.get('/api/v1.00/entities/contact_records/' + $scope.contactId)
    .success(function(data, status, headers, config){
      $scope.contact_record = data.contact_record;
      $scope.agentId = data.contact_record.agent;
      $scope.customerId = data.contact_record.customer;
  });
  $scope.BackToCustomerPage = function(agentId, customerId) {
    $window.location.href="/agents/" + agentId + "/customers/" + customerId;
  };
  $scope.backToAgent = function(agentId) {
    $window.location.href = "/agents/" + agentId;
  };
  $scope.backToAgentList = function() {
    $window.location.href = "/agents";
  };
}]);
