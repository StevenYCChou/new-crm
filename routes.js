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

app.engine('.html', require('ejs').renderFile);
//app.engine('ejs', engine);
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/jquery-ui-1.11.1", express.static(__dirname + '/public/jquery-ui-1.11.1'));
app.use("/jquery-ui-themes-1.11.1", express.static(__dirname + '/public/jquery-ui-themes-1.11.1'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());
//app.use(app.router);

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
  res.render('homepage.ejs');
});


////////////////////
// Manager Facade //
////////////////////
app.get('/agents', managerFacade.showAllAgents);
app.get('/agent/create', managerFacade.showAgentCreationPage);
app.post('/agent', managerFacade.createNewAgent);

//////////////////
// Agent Facade //
//////////////////

// profile related
app.get('/agent/:agentId', agentFacade.showProfile);
app.get('/agent/:agentId/edit', agentFacade.showProfileUpdatePage);
app.put('/agent/:agentId', agentFacade.updateProfile);

// customer related
app.get('/agent/:agentId/customer/:customerId', agentFacade.showCustomerByCustomerId);
app.get('/agent/:agentId/create', agentFacade.showCustomerCreationPage);
app.get('/agent/:agentId/customer/:customerId/edit', agentFacade.showCustomerUpdatePage);
app.post('/agent/:agentId', agentFacade.createCustomer);
app.put('/agent/:agentId/customer/:customerId', agentFacade.updateCustomer);
app.delete('/customer/:customerId', agentFacade.removeCustomerById);

// contact record related
app.get('/contact_history/create', agentFacade.showContactRecordCreationPage);
app.get('/contact_history/:contactHistoryId', agentFacade.retrieveContactRecordById);
app.post('/contact_history', agentFacade.createContactRecord);

/////////////////////
// Customer Facade //
/////////////////////
app.get('/customer/:customerId', customerFacade.retrieveProfilePage);
app.get('/customer/:customerId/edit', customerFacade.showProfileUpdatePage);
app.post('/customer/:customerId', customerFacade.updateProfile);
