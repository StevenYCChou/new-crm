var customerApp = angular.module('crmCustomerApp',[]);
var ecommCustomerApp = angular.module('ecommCustomerApp', []);

customerApp.controller('showDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[5];
  $http.get('/api/v1.00/entities/customers/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.data;
      data.links.forEach(function(link){
        if (link.rel == 'agent')
          $scope.agentLink = link.href;
      });
      $http.get($scope.agentLink)
        .success(function(data, status, headers, config) {
          $scope.agent = data.data;
          $http.get('/api/v1.00/entities/contact_records?q=customer=' + $scope.customerId + ',agent=' + $scope.agent._id)
            .success(function(data, status, headers, config) {
              $scope.contact_records = data.data;
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
    $window.location.href = "/crm/customers/" + customerId + "/edit";
  };
}]);

customerApp.controller('editDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.customerId = $location.absUrl().split("/")[5];
  $http.get('/api/v1.00/entities/customers/' + $scope.customerId)
    .success(function(data, status, headers, config) {
      $scope.customer = data.data;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  $scope.editCustomerSubmit = function(customerId, name, phone, email, location) {
    var data = {name: name, phone: phone, email: email, location: location};
    $http({
      url: '/api/v1.00/entities/customers/' + $scope.customerId,
      method: 'PUT',
      data: data})
      .success(function(data, status, headers, config) {
        $window.location.href="/crm/customers/" + customerId;
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
  $scope.returnToCustomer = function(customerId) {
    $window.location.href = "/crm/customers/" + customerId;
  };
}]);

ecommCustomerApp.controller('retrieveProductController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.categoryChoice = 'all';
  $scope.filterCategorys = [
    {name: 'all'},
    {name: 'music'},
    {name: 'book'},
    {name: 'cd'}
  ];

  $scope.searchKey = '';
  $scope.login = true;
/*  $http.get('/api/v1.00/entities/sessions')
    .success(function(data, status, headers, config) {
      if ('userid' in data){
        $scope.login = true;
        $scope.userid = data.userid;
      } else {
        $scope.login = false;
      }
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });*/

  $http.get('/api/v1.00/entities/products')
    .success(function(data, status, headers, config) {
      $scope.products = [];
      data.data.forEach(function(product){
        var productsAttributes = {};
        for (key in product) {
          if (key!= 'id' && key!= 'links' && key!= 'imagelink'){
            if (key == 'category') {
              productsAttributes[key] = '';
              product[key].forEach(function(keys) {
                 productsAttributes[key] += keys + ', ';
              });
              productsAttributes[key] = productsAttributes[key].substring(0, productsAttributes[key].length-2);
            } else {
              productsAttributes[key] = product[key];
            }
          }
        }
        $scope.products.push({id: product['id'], productsAttributes: productsAttributes});
      });
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });

  $scope.login = function(customer_id) {
    $http({
      url: '/api/v1.00/entities/sessions/',
      method: 'PUT',
      data: {userId: customer_id}
    })
    .success(function(data, status, headers, config) {
      $window.location.href="/ecomm/customers/products";
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  }

  $scope.viewStats = function() {
    $window.location.href="/ecomm/customers/viewStats";
  }

  $scope.shoppingCarts = function() {
    $window.location.href="/ecomm/customers/shoppingCarts";
  }

  $scope.productFilter = function(product_category) {
    var href = '/api/v1.00/entities/products?q=category=' + product_category;
    if (product_category == 'all') {
      href = '/api/v1.00/entities/products';
    }
    console.log(href);
    $http.get(href)
      .success(function(data, status, headers, config) {
        $scope.products = [];
        data.data.forEach(function(product){
          var productsAttributes = {};
          for (key in product) {
            if (key!= 'id' && key!= 'links' && key!= 'imagelink'){
              if (key == 'category') {
                productsAttributes[key] = '';
                product[key].forEach(function(keys) {
                   productsAttributes[key] += keys + ', ';
                });
                productsAttributes[key] = productsAttributes[key].substring(0, productsAttributes[key].length-2);
              } else {
                productsAttributes[key] = product[key];
              }
            }
          }
          $scope.products.push({id: product['id'], productsAttributes: productsAttributes});
        });
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  }
  $scope.productSearch = function(product_category, searchKey) {
    var href = '/api/v1.00/entities/products?searchKey=' + $scope.searchKey;
    if (scope.categoryChoice.name !== 'All') {
      href += 'category='+$scope.categoryChoice.name;
    }
    $http.get(href)
      .success(function(data, status, headers, config) {
        $scope.products = data.data;
      })
      .error(function(data, status, headers, config) {
        $scope.errorStatus = status;
        $scope.errorData = data;
        $window.alert("Status: " + status + ", " + data);
      });
  };
  $scope.productDetail = function(product_id) {
    $window.location.href = "/ecomm/customers/product/" + product_id;
  };
}]);

ecommCustomerApp.controller('productDetailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $scope.productId = $location.absUrl().split("/")[6];
  $http.get('/api/v1.00/entities/products/' + $scope.productId)
    .success(function(data, status, headers, config) {
      $scope.shortDescription = data.data.shortdescription;
      $scope.longDescription = data.data.longdescription;
      $scope.sellerComments = data.data.sellercomments;
      $scope.imageLink = data.data.imagelink;

      var products = {};
      var categories = {};
      products[$scope.productId] = 1;
      data.data.category.forEach(function(category) {
          categories[category] = 1;
        });
      var put_data = {products: products, categories: categories};
      $http({
          url: '/api/v1.00/entities/session_view_stats/',
          contentType: "applictaion/json",
          method: 'PUT',
          data: put_data
        })
        .success(function(data, status, headers, config) {

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

  $scope.getProducts = function(){
    $window.location.href="/ecomm/customers/products";
  };

  $scope.viewStats = function(){
    $window.location.href="/ecomm/customers/viewStats";
  };

  $scope.shoppingCarts = function() {
    $window.location.href="/ecomm/customers/shoppingCarts";
  }

  $scope.productPurchase = function(){
    var products = {};
    products[$scope.productId] = 1;

//    var put_data = {products: products};
//    console.log(put_data);
    $http({
      url: '/api/v1.00/entities/session_shopping_carts/',
      contentType: "applictaion/json",
      method: 'PUT',
      data: products
    })
    .success(function(data, status, headers, config) {
      $window.location.href="/ecomm/customers/shoppingCarts";
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  };
}]);

ecommCustomerApp.controller('viewStatsController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $http.get('/api/v1.00/entities/session_view_stats')
    .success(function(data, status, headers, config) {
       $scope.product_stat = data.data.products;
       $scope.category_stat = data.data.categories;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });

  $scope.productsList = function() {
    $window.location.href = "/ecomm/customers/products";
  }

  $scope.viewStats = function(){
    $window.location.href="/ecomm/customers/viewStats";
  };

  $scope.shoppingCarts = function() {
    $window.location.href="/ecomm/customers/shoppingCarts";
  }
}]);

ecommCustomerApp.controller('shoppingCartsController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  $http.get('/api/v1.00/entities/session_shopping_carts')
    .success(function(data, status, headers, config) {
       $scope.product_cart = data.data;
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });

  $scope.productsList = function() {
    $window.location.href = "/ecomm/customers/products";
  }

  $scope.viewStats = function(){
    $window.location.href="/ecomm/customers/viewStats";
  };

  $scope.shoppingCarts = function() {
    $window.location.href="/ecomm/customers/shoppingCarts";
  }

  $scope.Updatequantity = function() {
    $http({
      url: '/api/v1.00/entities/session_shopping_carts',
      method: 'PUT',
      data: $scope.products
    })
    .success(function(data, status, headers, config) {
      $window.location.href="/ecomm/customers/shoppingCarts";
    })
    .error(function(data, status, headers, config) {
      $scope.errorStatus = status;
      $scope.errorData = data;
      $window.alert("Status: " + status + ", " + data);
    });
  }
}]);
