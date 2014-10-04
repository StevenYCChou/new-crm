var AgentController = require('./AgentController.js');
var CustomerController = require('./CustomerController.js');
var ContactHistoryController = require('./ContactHistoryController.js');

var express = require('express');
var http = require('http');
var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname+ '/views');
app.set('view engine', 'html');
http.createServer(app).listen(3000);

app.get('/', function(req, res) {
  res.render('homepage.ejs');
});

// Agent Controller
app.get('/agents', AgentController.getAll);
// app.post('/agent', AgentController.create);
// app.get('/agent/:agentID', AgentController.retrieve);
// app.get('agent/:agentID/edit', AgentController.showUpdatePage);
// app.put('/agent/:agentID', AgentController.update);
// app.get('/agents', AgentController.getAll);
// app.get('/agents', AgentController.getAll);
// app.get('agent/:agentID/customer/:customerID', AgentController.showCustomer);

//   'GET /agent/create': { view: 'agents/create' },

//   // Customer Controller
//   'GET /agent/:agentID/create': 'CustomerController.showCreate',
//   'POST /agent/:agentID': 'CustomerController.create',
//   'GET /agent/:agentID/customer/:customerID/edit': 'CustomerController.showUpdatePage',
//   'PUT /agent/:agentID/customer/:customerID': 'CustomerController.update',
//   'DELETE /customer/:agentID': 'CustomerController.delete',
app.get('/customer/:customerID', CustomerController.retrieve);
//   'GET /customer/:customerID/edit': 'CustomerController.showUpdatePage',
//   'POST / customer/:customerID': 'CustomerController.update',

//   // ContactHistory Controller
app.get('/contact_history/:contactHistoryID', ContactHistoryController.retrieve);
//   'GET /contact_history/create': 'ContactHistoryController.showCreate',
//   'POST /contact_history': 'ContactHistoryController.create',