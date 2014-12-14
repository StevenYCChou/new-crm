var managerApp = angular.module('crmManagerApp', []);
var ecommManagerApp = angular.module('ecommCustomerApp', []);

managerApp.controller('agentIndexController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $http.get('/api/v1.00/entities/agents')
    .success(function(data, status, headers, config) {
       $scope.agents = data.data;
  });
  $scope.createAgent = function() {
    $window.location.href="/crm/agents/create";
  };
  $scope.agentDetail = function(id) {
    $window.location.href="/crm/agents/" + id;
  }
}]);

managerApp.controller('agentCreateController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  $scope.createAgentSubmit = function(agent_name, agent_phone, agent_email, agent_location) {
    var data = {name: agent_name, phone: agent_phone, email: agent_email, location: agent_location};
    $http({
      url: '/api/v1.00/entities/agents',
      method: 'POST',
      data: data})
      .success(function(data, status, headers, config) {
       $window.location.href="/crm/agents";
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
  $scope.createAgentCancel = function() {
    $window.location.href="/crm/agents";
  };
}]);

ecommManagerApp.controller('retrieveProductController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $http.get('/api/v1.00/entities/products')
    .success(function(data, status, headers, config) {
      $scope.products = [];
        data.data.forEach(function(product){
          var productsAttributes = {};
          var category = '';
          for (key in product) {
            if (key == 'category'){
              product['old_category'] = product['category'];
              category = '';
              for (keys in product[key]) {
                 category += product[key][keys] + ', ';
              }
              product[key] = category.substring(0, category.length-2);
            } else if (key!= 'id' && key!= 'links' && key!= 'imagelink'){
              productsAttributes[key] = product[key];
            }
          }
          $scope.products.push({id: product['id'], imagelink: product['imagelink'], category: product['category'], old_category: product['old_category'], productsAttributes: productsAttributes});
        });
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.createProduct = function() {
    $window.location.href = "/ecomm/managers/createProduct";
  };
  $scope.productDetail = function(id) {
    $window.location.href = "/ecomm/managers/product/" + id;
  };
  $scope.productUpdateSummary = function(product_id) {
    var post_data = {};
    $scope.products.forEach(function(product) {
      if (product.id == product_id) {
        for (key in product.productsAttributes) {
          post_data[key] = product.productsAttributes[key];
        }
        post_data['category'] = product.old_category;
        post_data['imagelink'] = product.imagelink;
      }
    });

    $http({
      url: '/api/v1.00/entities/products/' + product_id,
      method: 'PUT',
      data: post_data
    })
      .success(function(data, status, headers, config) {
        $window.location.href="/ecomm/managers/products";
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
  $scope.productDelete = function(product_id) {
    $http({
      url: '/api/v1.00/entities/products/' + product_id,
      method: 'DELETE'})
      .success(function(data, status, headers, config) {
        $window.location.href="/ecomm/managers/products";
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
}]);

ecommManagerApp.controller('addProductController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.templates = [
    {name: 'Books'},
    {name: 'Shoes'},
    {name: 'No template'}
  ];
  $scope.filterCategorys = [
    {name: 'music', data: ''},
    {name: 'book', data: ''},
    {name: 'cd', data: ''}
  ];
  $scope.templateChange = function(template) {
    $scope.fields=[];
    if (template.name == 'Books') {
       $scope.fields = [
          {field_num: '1', attr: 'Name', read: 'true', type: "text", data: '', name_place: 'Name',field_place: 'Name'},
          {field_num: '2', attr: 'ISBN', read: 'true', type: "text", data: '', name_place: 'ISBN',field_place: 'ISBN'},
          {field_num: '3', attr: 'Author', read: 'true', type: "text", data: '', name_place: 'Author',field_place: 'Author'},
          {field_num: '4', attr: 'Price', read: 'true', type: "number", data: '', name_place: 'Price',field_place: 'Price'},
          {field_num: '5', attr: 'Quantity', read: 'true', type: "number", data: '', name_place: 'Quantity',field_place: 'Quantity'},
          {field_num: '6', attr: 'shortDescription', read: 'true', type: "text", data: '', name_place: 'shortDescription',field_place: 'shortDescription'},
          {field_num: '7', attr: 'longDescription', read: 'true', type: "text", data: '', name_place: 'longDescription',field_place: 'longDescription'},
          {field_num: '8', attr: 'sellerComments', read: 'true', type: "text", data: '', name_place: 'sellerComments',field_place: 'sellerComments'},
          {field_num: '9', attr: 'imageLink', read: 'true', type: "text", data: '', name_place: 'imageLink',field_place: '/bucket/key'}     
        ];
    } else if (template.name == 'Shoes') {
        $scope.fields = [
          {field_num: '1', attr: 'Name', read: 'true', type: "text", data: '', name_place: 'Name',field_place: 'Name'},
          {field_num: '2', attr: 'Color', read: 'true', type: "text", data: '', name_place: 'Color',field_place: 'Color'},
          {field_num: '3', attr: 'Size', read: 'true', type: "text", data: '', name_place: 'Size',field_place: 'Size'},
          {field_num: '4', attr: 'Price', read: 'true', type: "number", data: '', name_place: 'Price',field_place: 'Price'},
          {field_num: '5', attr: 'Quantity', read: 'true', type: "number", data: '', name_place: 'Quantity',field_place: 'Quantity'},
          {field_num: '6', attr: 'shortDescription', read: 'true', type: "text", data: '', name_place: 'shortDescription',field_place: 'shortDescription'},
          {field_num: '7', attr: 'longDescription', read: 'true', type: "text", data: '', name_place: 'longDescription',field_place: 'longDescription'},
          {field_num: '8', attr: 'sellerComments', read: 'true', type: "text", data: '', name_place: 'sellerComments',field_place: 'sellerComments'},
          {field_num: '9', attr: 'imageLink', read: 'true', type: "text", data: '', name_place: 'imageLink',field_place: '/bucket/key'}
        ];
    } else if (template.name == 'No template') {
        $scope.fields = [
          {field_num: '1', attr: 'Name', read: 'true', type: "text", data: '', name_place: 'Name',field_place: 'Name'},
          {field_num: '2', attr: 'Price', read: 'true', type: "number", data: '', name_place: 'Price',field_place: 'Price'},
          {field_num: '3', attr: 'Quantity', read: 'true', type: "number", data: '', name_place: 'Quantity',field_place: 'Quantity'},
          {field_num: '4', attr: 'shortDescription', read: 'true', type: "text", data: '', name_place: 'shortDescription',field_place: 'shortDescription'},
          {field_num: '5', attr: 'longDescription', read: 'true', type: "text", data: '', name_place: 'longDescription',field_place: 'longDescription'},
          {field_num: '6', attr: 'sellerComments', read: 'true', type: "text", data: '', name_place: 'sellerComments',field_place: 'sellerComments'},
          {field_num: '7', attr: 'imageLink', read: 'true', type: "text", data: '', name_place: 'imageLink',field_place: '/bucket/key'},
          {field_num: '8', attr: '', read: "false", type: "text", data: '', name_place: 'Field Name', field_place: 'Field value'}
        ];
    }
  };

  $scope.uniqueString = function() {
    var text     = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  $scope.createProductSubmit = function(product_id, fields, template) {
    var post_data;
    var category = [];
    $scope.filterCategorys.forEach(function(cate){
      if (cate.data == true)
      category.push(cate.name);
    });
    if (template.name == 'Books'){
      post_data = {
        id: product_id,
        category: category,
        name: fields[0].data,
        isbn: fields[1].data,
        author: fields[2].data,
        price: fields[3].data,
        quantity: fields[4].data,
        shortdescription: fields[5].data,
        longdescription: fields[6].data,
        sellercomments: fields[7].data,
        imagelink: fields[8].data,
      };
    } else if (template.name == 'Shoes'){
      post_data = {
        id: product_id,
        category: category,
        name: fields[0].data,
        color: fields[1].data,
        size: fields[2].data,
        price: fields[3].data,
        quantity: fields[4].data,
        shortdescription: fields[5].data,
        longdescription: fields[6].data,
        sellercomments: fields[7].data,
        imagelink: fields[8].data,
      };
    } else if (template.name == 'No template'){
      post_data = {
        id: product_id,
        category: category,
        name: fields[0].data,
        price: fields[1].data,
        quantity: fields[2].data,
        shortdescription: fields[3].data,
        longdescription: fields[4].data,
        sellercomments: fields[5].data,
        imagelink: fields[6].data,
        field1: fields[7].attr,
        value1: fields[7].data,
      };
    }
    $http({
      url: '/api/v1.00/entities/products',
      method: 'POST',
      data: post_data})
      .success(function(data, status, headers, config) {
        $window.location.href="/ecomm/managers/products";
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  }
  $scope.createProductCancel = function() {
    $window.location.href = "/ecomm/managers/products";
  }
}]);

ecommManagerApp.controller('productDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.productId = $location.absUrl().split("/")[6];
  $http.get('/api/v1.00/entities/products/' + $scope.productId)
    .success(function(data, status, headers, config) {
      $scope.shortDescription = data.data.shortdescription;
      $scope.longDescription = data.data.longdescription;
      $scope.sellerComments = data.data.sellercomments;
      $scope.imageLink = data.data.imagelink;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.getProducts = function(){
    $window.location.href="/ecomm/managers/products";
  };
  $scope.updateProductDetail = function(product_id) {
    var put_data = {
      updatetype: 'detail',
      detail: {
        productId: product_id,
        shortdescription: $scope.shortdescription,
        longdescription: $scope.longdescription,
        sellervomments: $scope.sellercomments,
      }
    };
    $http({
      url: '/api/v1.00/entities/product/' + product_id,
      method: 'PUT',
      data: put_data})
      .success(function(data, status, headers, config) {
        $window.location.href="/ecomm/managers/product/" + product_id;
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
}]);