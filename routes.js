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
var cors = require('cors');

app.engine('html', require('ejs').renderFile);
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/jquery-ui-1.11.1", express.static(__dirname + '/public/jquery-ui-1.11.1'));
app.use("/jquery-ui-themes-1.11.1", express.static(__dirname + '/public/jquery-ui-themes-1.11.1'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.use(express.static(__dirname + '/views'));
app.use(cors());

app.set('views', __dirname+'/views');
app.set('view engine', 'html'); // default view engine

////////////////////
//   Web Server   //
////////////////////
http.createServer(app).listen(3000);

////////////////////
//  MessageQueue  //
////////////////////
//var mq = require('./message_queue/main.js');
//mq.startMessageQueueService(8000);

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

/////////////////////
// Ecommerce-API //
/////////////////////
app.get('/api/v1.00/ecomm/entities/products', api.getProducts);
app.get('/api/v1.00/ecomm/entities/product/:productId', api.getProductDetail);
app.post('/api/v1.00/ecomm/entities/products', api.createProduct);