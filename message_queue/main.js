var http = require('http');
var httpProxy = require('http-proxy');
var AWS = require('aws-sdk');

var configs = require('../configs.js');
var crmSqs = require('../crm_aws_module/SQS.js');
var crmSns = require('../crm_aws_module/SNS.js');
var routes = require('../routes.js');

var reqQueue = configs.awsSqs.reqQueue;
var proxy = httpProxy.createProxyServer();

var webServerAddress = 'http://localhost:3000';
var messagedReq = [[/^\/contact_history\/(?:([^\/]+?))\/?$/i, 'GET']];

var mqThreshold = 2;
var mqFlag = false
var requests = {};
var counter = 0;


var startMessageQueueService = function startMessageQueueService(port) {
  console.log('Starting proxy server...');
  startProxyServer(port);

  console.log('Starting Queue handler...');
  processing = setInterval(function() {
    crmSqs.receiveMessage(reqQueue, crmProxyProcessor);
  }, 1000);

  console.log('Starting Counter checking...');
  counting = setInterval(function() {
    trafficWatcher();
  }, 5000)
}

var crmProxyProcessor = function crmProxyProcessor(message) {
  var requestId = JSON.parse(message).Message;
  if (requestId in requests) {
    proxy.web(requests[requestId][0], requests[requestId][1], {target: webServerAddress});
    delete requests[requestId];
  }
}

function trafficWatcher() {
  if (counter >= mqThreshold) {
    mqFlag = true;
  } else {
    mqFlag = false;
  }
  counter = 0;
}

function requestIdGenerator(){
  var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  var requestId = randLetter + Date.now();

  return requestId;
}

function mqSnsPublish(req, res){
  console.log('Sending a message ...', req.url)
  var requestId = requestIdGenerator();
  requests[requestId] = [req, res];
  crmSns.publish(requestId);
}

function crmProxyFilter(req, res) {
  for (i = 0; i < messagedReq.length; i++) {
    var re = new RegExp(messagedReq[i][0]);
    if (new RegExp(messagedReq[i][0]).test(req.url) && messagedReq[i][1] == req.method) {
      mqSnsPublish(req, res);
      return;
    };
  }

  console.log('Proxy the request ...', req.url)
  proxy.web(req, res, {target: webServerAddress});
}

function startProxyServer(port, messageAll) {
  if (typeof(messageAll) === 'undefined') messageAll = true;

  var proxy = httpProxy.createProxyServer({});
  http.createServer(function (req, res) {
    counter ++;
    console.log('[server]', mqFlag);
    if(mqFlag) {
      if (messageAll) {
        mqSnsPublish(req, res);
      } else{
        crmProxyFilter(req, res);
      }
    } else {
      proxy.web(req, res, {target: webServerAddress});
    }
  }).listen(port);
}

// test server
function startHttpServer() {
  http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
  }).listen();
}

exports.startMessageQueueService = startMessageQueueService;
