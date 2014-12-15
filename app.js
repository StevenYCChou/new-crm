var restfulHelper = require('./api/restful_helper.js');
var businessService = require('./business_service/business_service.js');
var mongodbService = require('./data_service/mongodb_service.js');

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
  if (!req.session.views) {
    req.session.views = 1;

    var sessionId = 'session:' + req.sessionID;
    var multi = redisClient.multi();
    multi.hmset(sessionId, 'userId', null)
    multi.expire(sessionId, SESSION_TIMEOUT_SECONDS);

    multi.exec(function(err, replies){
      next();
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

app.use('/crm', require('./routers/crm'));
app.use('/ecomm', require('./routers/ecomm'));
app.use('/api/v1.00', require('./routers/api/v1.00'));

////////////////////
//   Web Server   //
////////////////////
http.createServer(app).listen(3000);
