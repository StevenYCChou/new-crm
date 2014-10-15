var AgentController = require('./controller/agentController.js');
var CustomerController = require('./controller/customerController.js');
var ContactHistoryController = require('./controller/contactHistoryController.js');

var express = require('express');
var http = require('http');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var multer = require('multer');

app.engine('ejs', engine);
app.use("/js", express.static(__dirname + '/public/js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());
//app.use(app.router);

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs'); // default view engine

http.createServer(app).listen(3000);
app.get('/', function(req, res) {
  res.render('homepage.ejs');
});

// Agent Controller
app.get('/agents', AgentController.getAll);

app.get('/agent/create', AgentController.showCreatePage); 
app.post('/agent', AgentController.create);

app.get('/agent/:agentId', AgentController.retrieve);
app.get('/agent/:agentId/edit', AgentController.showUpdatePage);
app.put('/agent/:agentId', AgentController.update);

app.get('/agent/:agentId/customer/:customerId', AgentController.showCustomer);

//   // Customer Controller
app.get('/agent/:agentId/create', CustomerController.showCreate);
app.post('/agent/:agentId', CustomerController.createViaAgent);
app.get('/agent/:agentId/customer/:customerId/edit', CustomerController.showUpdatePageViaAgent);
app.put('/agent/:agentId/customer/:customerId', CustomerController.updateViaAgent);
app.delete('/customer/:customerId', CustomerController.delete);
app.get('/customer/:customerId', CustomerController.retrieve);
app.get('/customer/:customerId/edit', CustomerController.showUpdatePageViaCustomer);
app.post('/customer/:customerId', CustomerController.updateViaCustomer);

//   // ContactHistory Controller
app.get('/contact_history/create', ContactHistoryController.showCreate);
app.get('/contact_history/:contactHistoryId', ContactHistoryController.retrieve);
app.post('/contact_history', ContactHistoryController.create);
