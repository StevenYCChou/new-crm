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

app.get('/agent/:agentID', AgentController.retrieve);
app.get('/agent/:agentID/edit', AgentController.showUpdatePage);
app.put('/agent/:agentID', AgentController.update);

app.get('/agent/:agentID/customer/:customerID', AgentController.showCustomer);

//   // Customer Controller
app.get('/agent/:agentID/create', CustomerController.showCreate);
app.post('/agent/:agentID', CustomerController.createViaAgent);
app.get('/agent/:agentID/customer/:customerID/edit', CustomerController.showUpdatePageViaAgent);
app.put('/agent/:agentID/customer/:customerID', CustomerController.updateViaAgent);
app.delete('/customer/:customerID', CustomerController.delete);
app.get('/customer/:customerID', CustomerController.retrieve);
app.get('/customer/:customerID/edit', CustomerController.showUpdatePageViaCustomer);
app.post('/customer/:customerID', CustomerController.updateViaCustomer);

//   // ContactHistory Controller
app.get('/contact_history/create', ContactHistoryController.showCreate);
app.get('/contact_history/:contactHistoryID', ContactHistoryController.retrieve);
app.post('/contact_history', ContactHistoryController.create);
