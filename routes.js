var AgentController = require('./controller/AgentController.js');
var CustomerController = require('./controller/CustomerController.js');
var ContactHistoryController = require('./controller/ContactHistoryController.js');

var express = require('express');
var http = require('http');
var app = express();
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

app.get('agent/:agentID/customer/:customerID', AgentController.showCustomer);

//   // Customer Controller
app.get('/agent/:agentID/create', CustomerController.showCreate);
app.post('/agent/:agentID', CustomerController.create);
app.get('/agent/:agentID/customer/:customerID/edit', CustomerController.showUpdatePage);
app.put('/agent/:agentID/customer/:customerID', CustomerController.update);
app.delete('/customer/:agentID', CustomerController.delete);
app.get('/customer/:customerID', CustomerController.retrieve);
app.get('/customer/:customerID/edit', CustomerController.showUpdatePage);
app.post('/customer/:customerID', CustomerController.update);

//   // ContactHistory Controller
app.get('/contact_history/:contactHistoryID', ContactHistoryController.retrieve);
app.get('/contact_history/create', ContactHistoryController.showCreate);
app.post('/contact_history', ContactHistoryController.create);