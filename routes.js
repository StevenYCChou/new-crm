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
//   Web Server   //
////////////////////
http.createServer(app).listen(3000);

////////////////////
//  MessageQueue  //
////////////////////
var mq = require('./message_queue/main.js');
mq.startMessageQueueService(8000);

app.get('/', function(req, res) {
  res.render('homepage');
});

app.get('/api/v1.00/entities/agents', api.getAgents);
app.get('/api/v1.00/entities/agents/:id', api.getAgent);
// app.post('/api/v1.00/entities/agents', api.createAgent);
// app.put('/api/v1.00/entities/agents/:id', api.updateAgent);
// app.delete('/api/v1.00/entities/agents/:id', api.createAgent);

// app.get('/api/v1.00/entities/agents/:agentId', api.getAgent);
// app.put('/api/v1.00/entities/agents/:agentId', api.updateAgent);
// app.post('/api/v1.00/entities/agents/create', api.createAgent);

app.get('/api/v1.00/entities/customers', api.getCustomers);
app.put('/api/v1.00/entities/customers/:customerId', api.updateCustomer);
app.post('/api/v1.00/entities/customers/create', api.createCustomer);
app.delete('/api/v1.00/entities/customers/:customerId', api.removeCustomer);

app.get('/api/v1.00/entities/contact-records', api.getContactRecords);
app.post('/api/v1.00/entities/contact-records/create', api.createContactRecord);

////////////////////
// Manager Facade //
////////////////////
app.get('/agents', managerFacade.showAllAgents);
// app.get('/api/agents', managerFacade.showAllAgentsAPI);
app.get('/agent/create', managerFacade.showAgentCreationPage);
app.post('/api/agent', managerFacade.createNewAgentAPI);

//////////////////
// Agent Facade //
//////////////////

// profile related
app.get('/agent/:agentId', agentFacade.showProfile);
app.get('/api/agent/:agentId', agentFacade.showProfileAPI);
app.get('/agent/:agentId/edit', agentFacade.showProfileUpdatePage);
app.get('/api/agent/:agentId/edit', agentFacade.showProfileUpdatePageAPI);
app.put('/api/agent/:agentId', agentFacade.updateProfileAPI);

// customer related
app.get('/agent/:agentId/customer/:customerId', agentFacade.showCustomerByCustomerId);
app.get('/api/agent/:agentId/customer/:customerId', agentFacade.showCustomerByCustomerIdAPI);
app.get('/agent/:agentId/create', agentFacade.showCustomerCreationPage);
app.get('/agent/:agentId/customer/:customerId/edit', agentFacade.showCustomerUpdatePage);
app.post('/api/agent/:agentId', agentFacade.createCustomerAPI);
app.put('/api/agent/:agentId/customer/:customerId', agentFacade.updateCustomerAPI);
app.delete('/api/customer/:customerId', agentFacade.removeCustomerByIdAPI);

// contact record related
app.get('/contact_history/create', agentFacade.showContactRecordCreationPage);
app.get('/api/contact_history/:contactHistoryId', agentFacade.retrieveContactRecordByIdAPI);
app.get('/contact_history/:contactHistoryId', agentFacade.retrieveContactRecordById);
app.post('/api/contact_history', agentFacade.createContactRecordAPI);

/////////////////////
// Customer Facade //
/////////////////////
app.get('/customer/:customerId', customerFacade.retrieveProfilePage);
app.get('/api/customer/:customerId', customerFacade.retrieveProfilePageAPI)
app.get('/customer/:customerId/edit', customerFacade.showProfileUpdatePage);
app.post('/api/customer/:customerId', customerFacade.updateProfileAPI);
