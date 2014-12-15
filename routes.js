var api = require('./api.js');
var restfulHelper = require('./api/restful_helper.js');
var businessService = require('./business_service/business_service.js');
var mongodbService = require('./data_service/mongodb_service.js');
var entryPages = require('./entryPages.js');
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
app.use("/css", express.static(__dirname + '/public/css'));
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
  req.headers.uuid = hash(req.originalUrl);
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

  if (!session.views) {
    session.views = 1;

    var userId = typeof req.query.userId === "undefined" ? null : req.query.userId;
    session.userId = userId;

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

app.get('/crm/', entryPages.crmHomepage);
app.get('/crm/about', entryPages.crmAboutpage);
app.get('/ecomm/', entryPages.ecommHomepage);
app.get('/ecomm/about', entryPages.ecommAboutpage)

app.use('/api/v1.00/entities/agents', require('./routers/api/agents.js'));
app.use('/api/v1.00/entities/customers', require('./routers/api/customers.js'));
app.use('/api/v1.00/entities/contact_records', require('./routers/api/contact_records.js'));
app.use('/api/v1.00/entities/products', require('./routers/api/products.js'));
app.use('/api/v1.00/entities/sessions', require('./routers/api/sessions.js'));
app.use('/api/v1.00/entities/session_view_stats', require('./routers/api/session_view_stats.js'));
app.use('/api/v1.00/entities/user_view_stats', require('./routers/api/user_view_stats.js'));
app.use('/api/v1.00/entities/session_shopping_carts', require('./routers/api/session_shopping_carts.js'));
app.use('/api/v1.00/entities/user_shopping_carts', require('./routers/api/user_shopping_carts.js'));
app.use('/api/v1.00/entities/responses', require('./routers/api/responses.js'));
app.use('/api/v1.00/actions', require('./routers/api/actions.js'));
////////////////////
// Manager Facade //
////////////////////
app.get('/crm/agents', managerFacade.showAllAgents);
app.get('/crm/agents/create', managerFacade.showAgentCreationPage);

//////////////////
// Agent Facade //
//////////////////

// profile related
app.get('/crm/agents/:agentId', agentFacade.showProfile);
app.get('/crm/agents/:agentId/edit', agentFacade.showProfileUpdatePage);

// customer related
app.get('/crm/agents/:agentId/customers/:customerId', agentFacade.showCustomerDetailPage);
app.get('/crm/agents/:agentId/create', agentFacade.showCustomerCreationPage);
app.get('/crm/agents/:agentId/customers/:customerId/edit', agentFacade.showCustomerUpdatePage);

// contact record related
app.get('/crm/contact_records/create', agentFacade.showContactRecordCreationPage);
app.get('/crm/contact_records/:contactRecordId', agentFacade.retrieveContactRecordById);

/////////////////////
// Customer Facade //
/////////////////////
app.get('/crm/customers/:customerId', customerFacade.retrieveProfilePage);
app.get('/crm/customers/:customerId/edit', customerFacade.showProfileUpdatePage);

/////////////////////
// Ecommerce-Customer Facade //
/////////////////////
app.get('/ecomm/customers/products', customerFacade.showProductsPage);
app.get('/ecomm/customers/product/:productId', customerFacade.showProductDetail);
app.get('/ecomm/customers/viewStats', customerFacade.showViewStats);
app.get('/ecomm/customers/shoppingCarts', customerFacade.showShoppingCarts);

/////////////////////
// Ecommerce-Manager Facade //
/////////////////////
app.get('/ecomm/managers/products', managerFacade.showProductsPage);
app.get('/ecomm/managers/createProduct', managerFacade.createProductsPage);
app.get('/ecomm/managers/product/:productId', managerFacade.showProductDetail);

/////////////////////
//  Shopping Cart  //
/////////////////////
// var shoppingCartApi = require('./shoppingCartApi.js');
// app.get('/api/v1.00/entities/shoppingcarts', shoppingCartApi.getShoppingCart);
// app.put('/api/v1.00/entities/shoppingcarts', shoppingCartApi.updateShoppingCart);

// app.delete('/api/v1.00/entities/shoppingcarts', shoppingCartApi.clearShoppingCart);
// app.get('/api/v1.00/entities/shoppingcarts/:session', shoppingCartApi.getShoppingCart);
// app.put('/api/v1.00/entities/shoppingcarts/:session', shoppingCartApi.updateShoppingCart);
// app.delete('/api/v1.00/entities/shoppingcarts/:session', shoppingCartApi.clearShoppingCart);

/////////////////////
//  ViewedHistory  //
/////////////////////
var viewedHistoryApi = require('./viewedHistoryApi.js');
app.get('/api/v1.00/entities/viewedHistory', viewedHistoryApi.getViewedHistory);
app.put('/api/v1.00/entities/users/:userId/viewedHistory', viewedHistoryApi.updateViewedHistory);

////////////////////
//   Web Server   //
////////////////////
http.createServer(app).listen(3000);
