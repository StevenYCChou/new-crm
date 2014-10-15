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

app.get('/agent/:agentid', AgentController.retrieve);
app.get('/agent/:agentid/edit', AgentController.showUpdatePage);
app.put('/agent/:agentid', AgentController.update);

app.get('/agent/:agentid/customer/:customerid', AgentController.showCustomer);

//   // Customer Controller
app.get('/agent/:agentid/create', CustomerController.showCreate);
app.post('/agent/:agentid', CustomerController.createViaAgent);
app.get('/agent/:agentid/customer/:customerid/edit', CustomerController.showUpdatePageViaAgent);
app.put('/agent/:agentid/customer/:customerid', CustomerController.updateViaAgent);
app.delete('/customer/:customerid', CustomerController.delete);
app.get('/customer/:customerid', CustomerController.retrieve);
app.get('/customer/:customerid/edit', CustomerController.showUpdatePageViaCustomer);
app.post('/customer/:customerid', CustomerController.updateViaCustomer);

//   // ContactHistory Controller
app.get('/contact_history/create', ContactHistoryController.showCreate);
app.get('/contact_history/:contactHistoryid', ContactHistoryController.retrieve);
app.post('/contact_history', ContactHistoryController.create);
