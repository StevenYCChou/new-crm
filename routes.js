var api = require('./api.js');
var businessService = require('./business_service/business_service.js');
var managerFacade = businessService.managerFacade;
var agentFacade = businessService.agentFacade;
var customerFacade = businessService.customerFacade;

var express = require('express');
var http = require('http');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var multer = require('multer');
var uuid = require('uuid');
var cors = require('cors');

app.engine('html', require('ejs').renderFile);
//app.engine('ejs', engine);
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/jquery-ui-1.11.1", express.static(__dirname + '/public/jquery-ui-1.11.1'));
app.use("/jquery-ui-themes-1.11.1", express.static(__dirname + '/public/jquery-ui-themes-1.11.1'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());
app.use(function(req,res,next) {
  res.set('uuid', uuid.v1());
  next();
});

app.use(express.static(__dirname + '/views'));
//app.use(app.router);
app.use(cors());

app.set('views', __dirname+'/views');
app.set('view engine', 'html'); // default view engine

////////////////////
//    RabbitMq    //
////////////////////
var crmRabbtimqConnnection = require('./business_service/notification_service/rabbitmq_connection.js');
var crmUpdateNotificationService = require('./business_service/notification_service/consumer_update.js');
crmRabbtimqConnnection.getRabbitmqConnection(function(conn) {
  if (conn) {
    crmUpdateNotificationService.startConsumers();
  } else {
    console.log("fail to connect to rabbitmq");
  }
});

////////////////////
//  MessageQueue  //
////////////////////
//var mq = require('./message_queue/main.js');
//mq.startMessageQueueService(8000);

////////////////////
//   Web Server   //
////////////////////
console.log("Staring listening to the server. port: 3000");
http.createServer(app).listen(3000);

app.get('/', function(req, res) {
  res.render('homepage');
});

app.get('/api/v1.00/entities/agents', api.getAgents);
app.post('/api/v1.00/entities/agents', api.createAgent);
app.get('/api/v1.00/entities/agents/:id', api.getAgent);
app.put('/api/v1.00/entities/agents/:id', api.updateAgent);
// app.delete('/api/v1.00/entities/agents/:id', api.removeAgent);

app.get('/api/v1.00/entities/customers', api.getCustomers);
app.post('/api/v1.00/entities/customers', api.createCustomer);
app.get('/api/v1.00/entities/customers/:id', api.getCustomer);
app.put('/api/v1.00/entities/customers/:id', api.updateCustomer);
app.delete('/api/v1.00/entities/customers/:id', api.removeCustomer);

app.get('/api/v1.00/entities/contact_records', api.getContactRecords);
app.get('/api/v1.00/entities/contact_records/:id', api.getContactRecord);
app.post('/api/v1.00/entities/contact_records/create', api.createContactRecord);

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
app.get('/contact_history/create', agentFacade.showContactRecordCreationPage);
app.get('/contact_history/:contactHistoryId', agentFacade.retrieveContactRecordById);

/////////////////////
// Customer Facade //
/////////////////////
app.get('/customers/:customerId', customerFacade.retrieveProfilePage);
app.get('/customers/:customerId/edit', customerFacade.showProfileUpdatePage);

/*
//////////////////////////
// Notification Service //
//////////////////////////
app.get('/subscription/:agentId', notification.showSubscriptions); // showallsubscription.
app.get('/subscription/:agentId/create', notification.showSubscriptionCreationPage);
app.post('/subscription/:agentId', notification.createSubscription);
app.get('/subscription/:agentId/:subscriptionId/edit', notification.showSubscriptionUpdatePage);
app.put('/subscription/:agentId/:subscriptionId', notification.updateSubscription);
app.delete('/subscription/:subscriptionId', notification.removeSubscriptionById);
*/
var subscription = require('./business_service/subscription.js');
var subscriptionApi = require('./subscriptionApi.js')
app.get('/api/v1.00/entities/subscriptions', subscriptionApi.getSubscriptions);
app.post('/api/v1.00/entities/subscriptions', subscriptionApi.createSubscription);
app.get('/api/v1.00/entities/subscriptions/:id', subscriptionApi.getSubscription);
app.put('/api/v1.00/entities/subscriptions/:id', subscriptionApi.updateSubscription);
app.delete('/api/v1.00/entities/subscriptions/:id', subscriptionApi.removeSubscription);

app.get('/subscriptions/agents', subscription.showAllAgents);
app.get('/subscriptions/agents/:agentId', subscription.showAgentSubscriptions);
app.get('/subscriptions/agents/:agentId/create', subscription.showSubscriptionCreationPage);
app.get('/subscriptions/agents/:agentId/subscriptions/:subscriptionId/edit', subscription.showSubscriptionUpdatePage);
