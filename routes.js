var api = require('./api.js');
var restfulHelper = require('./api/restful_helper.js');
var businessService = require('./business_service/business_service.js');
var mongodbService = require('./data_service/mongodb_service.js');
var managerFacade = businessService.managerFacade;
var agentFacade = businessService.agentFacade;
var customerFacade = businessService.customerFacade;

var hash = require('object-hash');
var express = require('express');
var http = require('http');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var Qs = require('qs');

app.engine('html', require('ejs').renderFile);
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/jquery-ui-1.11.1", express.static(__dirname + '/public/jquery-ui-1.11.1'));
app.use("/jquery-ui-themes-1.11.1", express.static(__dirname + '/public/jquery-ui-themes-1.11.1'));
app.use("/bootstrap", express.static(__dirname + '/public/bootstrap'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.use(express.static(__dirname + '/views'));
app.use(cors());

app.set('views', __dirname+'/views');
app.set('view engine', 'html'); // default view engine

var appendUUID = function(req, res, next) {
  req.headers.uuid = hash(req.headers);
  req.headers.uuid += hash(req.body);
  next();
};

var dectectAndRestoreUUID = function(req, res, next) {
  var method = req.method;
  if (method === 'PUT' || method === 'POST' || method === 'DELETE') {
    var reqUUID = req.headers.uuid;
    mongodbService.Response.findOne({nonce: reqUUID}).exec().then(function(entry) {
      if (entry === null) {
        mongodbService.Response.create({nonce: reqUUID}).then(function(entry) {
          restfulHelper.responsePollingPage(res, reqUUID);
          next();
        }, function(err) {
          res.status(500).end();
        });
      } else {
        console.log('In dectectAndRestoreUUID: detect duplication.');
        restfulHelper.responsePollingPage(res, reqUUID);
      };
    }, function(err) {
      res.status(500).end();
    });
  } else {
    next();
  }
};

app.use(appendUUID);
app.use(dectectAndRestoreUUID);

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redisService = require('./data_service/redis_service');
var redisClient = redisService.getRedisClient();

var SESSION_TIMEOUT_MSECONDS = 3600000;
var SESSION_TIMEOUT_SECONDS = 3600;
app.use(session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'crm-session:',
    ttl: SESSION_TIMEOUT_SECONDS,
  }), 
  resave: true,
  saveUninitialized: true,
  secret: 'crm ecommerce',
  cookie: {
    maxAge: SESSION_TIMEOUT_MSECONDS,
  }
}));

app.use(function(req, res, next) {
  var session = req.session;
  var sessionId = 'session:' + req.sessionID;
  var userId = typeof req.param('UserId')  === "undefined" ? null : req.param('UserId');

  if (!session.views) {
    session.views = 1

    var shoppingCartId = sessionId + ':shoppingCart';
    var viewedProductsId = sessionId + ':viewedProducts';
    var viewedCategoriesId = sessionId + ':viewedCategories';

    var multi = redisClient.multi();
    multi.hmset(sessionId,
                'userId', userId,
                'shoppingCart', shoppingCartId,
                'viewedProducts', viewedProductsId,
                'viewedCategories', viewedCategoriesId);
    multi.expire(sessionId, SESSION_TIMEOUT_SECONDS);

    multi.hset(shoppingCartId, 'userId', userId);
    multi.expire(shoppingCartId, SESSION_TIMEOUT_SECONDS);

    multi.hset(viewedProductsId, 'userId', userId);
    multi.expire(viewedProductsId, SESSION_TIMEOUT_SECONDS);

    multi.hset(viewedCategoriesId, 'userId', userId);
    multi.expire(viewedCategoriesId, SESSION_TIMEOUT_SECONDS);

    multi.exec(function(err, replies){
      // TODO.
    });
  }
  next();
})

app.use(function(req, res, next) {
  var constraints = {};
  if (req.query.limit) {
    constraints.limit = parseInt(req.query.limit);
  }
  if (req.query.offset) {
    constraints.offset = parseInt(req.query.offset);
  }
  if (req.query.q) {
    constraints.query = Qs.parse(req.query.q, { delimiter: ',' });
  }
  if (req.query.field) {
    constraints.field = req.query.field.split(',');
  }
  req.constraints = constraints;
  next();
});

////////////////////
//  MessageQueue  //
////////////////////
// var mq = require('./message_queue/main.js');
// mq.startMessageQueueService(8000);

app.get('/', function(req, res) {
  res.render('homepage');
});

app.get('/api/v1.00/entities/agents', api.getAgents);
app.post('/api/v1.00/entities/agents', api.createAgent);
app.get('/api/v1.00/entities/agents/:id', api.getAgent);
app.put('/api/v1.00/entities/agents/:id', api.updateAgent);
app.delete('/api/v1.00/entities/agents/:id', api.removeAgent);

app.get('/api/v1.00/entities/customers', api.getCustomers);
app.post('/api/v1.00/entities/customers', api.createCustomer);
app.get('/api/v1.00/entities/customers/:id', api.getCustomer);
app.put('/api/v1.00/entities/customers/:id', api.updateCustomer);
app.delete('/api/v1.00/entities/customers/:id', api.removeCustomer);

app.get('/api/v1.00/entities/contact_records', api.getContactRecords);
app.post('/api/v1.00/entities/contact_records', api.createContactRecord);
app.get('/api/v1.00/entities/contact_records/:id', api.getContactRecord);
app.put('/api/v1.00/entities/contact_records/:id', api.updateContactRecord);
app.delete('/api/v1.00/entities/contact_records/:id', api.removeContactRecord);

////////////////////
// Manager Facade //
////////////////////
app.get('/agents', managerFacade.showAllAgents);
app.get('/agents/create', managerFacade.showAgentCreationPage);

//////////////////
// Agent Facade //
//////////////////

// profile related
app.get('/agents/:agentId', agentFacade.showProfile);
app.get('/agents/:agentId/edit', agentFacade.showProfileUpdatePage);

// customer related
app.get('/agents/:agentId/customers/:customerId', agentFacade.showCustomerDetailPage);
app.get('/agents/:agentId/create', agentFacade.showCustomerCreationPage);
app.get('/agents/:agentId/customers/:customerId/edit', agentFacade.showCustomerUpdatePage);

// contact record related
app.get('/contact_records/create', agentFacade.showContactRecordCreationPage);
app.get('/contact_records/:contactRecordId', agentFacade.retrieveContactRecordById);

/////////////////////
// Customer Facade //
/////////////////////
app.get('/customers/:customerId', customerFacade.retrieveProfilePage);
app.get('/customers/:customerId/edit', customerFacade.showProfileUpdatePage);

/////////////////////
// Ecommerce-Customer Facade //
/////////////////////
app.get('/ecomm/customer/products', customerFacade.showProductsPage);
app.get('/ecomm/customer/product/:productId', customerFacade.showProductDetail);

/////////////////////
// Ecommerce-Manager Facade //
/////////////////////
app.get('/ecomm/manager/products', managerFacade.showProductsPage);
app.get('/ecomm/manager/createProduct', managerFacade.createProductsPage);
app.get('/ecomm/manager/product/:productId', managerFacade.showProductDetail);

/////////////////////
// Ecommerce-API //
/////////////////////
app.get('/api/v1.00/entities/products', api.getProducts);
app.get('/api/v1.00/entities/products/:id', api.getProduct);
app.post('/api/v1.00/ecomm/entities/products', api.createProduct);
app.delete('/api/v1.00/ecomm/entities/product/:productId', api.removeProduct);
app.put('/api/v1.00/ecomm/entities/product/:productId', api.updateProduct);

/////////////////////
//  Shopping Cart  //
/////////////////////
var shoppingCartApi = require('./shoppingCartApi.js');
app.get('/api/v1.00/entities/shoppingcarts', shoppingCartApi.getShoppingCart);
app.put('/api/v1.00/entities/shoppingcarts', shoppingCartApi.updateShoppingCart);
app.delete('/api/v1.00/entities/shoppingcarts', shoppingCartApi.clearShoppingCart);
app.get('/api/v1.00/entities/shoppingcarts/:session', shoppingCartApi.getShoppingCart);
app.put('/api/v1.00/entities/shoppingcarts/:session', shoppingCartApi.updateShoppingCart);
app.delete('/api/v1.00/entities/shoppingcarts/:session', shoppingCartApi.clearShoppingCart);

/////////////////////
//  ViewedHistory  //
/////////////////////
// app.get('/api/v1.00/entities/users/:userId/viewedHistory', viewedHistoryApi.getViewedHistory);
var viewedHistoryApi = require('./viewedHistoryApi.js');
app.put('/api/v1.00/entities/users/:userId/viewedHistory', viewedHistoryApi.updateViewedHistory);

////////////////////
//   Web Server   //
////////////////////
http.createServer(app).listen(3000);
