var http = require('http');
var httpProxy = require('http-proxy');
var AWS = require('aws-sdk');

// setup AWS and SQS
var configs = require('../configs.js');
var crmSqs = require('../crm_aws_module/SQS.js');
var crmSns = require('../crm_aws_module/SNS.js');
var routes = require('../routes.js');

var reqQueue = configs.awsSqs.reqQueue;
var webServerAddress = 'http://localhost:3000';
var requests = {};
var messagedReq = [[/^\/contact_history\/(?:([^\/]+?))\/?$/i, 'GET']];

var proxy = httpProxy.createProxyServer();


// --- Start
//console.log('Starting HTTP server...');
//startHttpServer();
var startMessageQueueService = function startMessageQueueService(port) {
  console.log('Starting proxy server...');
  startProxyServer(port);

  console.log('Starting Queue handler...');
  processing = setInterval(function(){
    crmSqs.receiveMessage(reqQueue, crmProxyProcessor);
  }, 100);
}

// --- functions

var crmProxyProcessor = function crmProxyProcessor(message) {

  var requestId = JSON.parse(message).Message;

  if (requestId in requests) {
    // req, res
    proxy.web(requests[requestId][0], requests[requestId][1], {target: webServerAddress});

    delete requests[requestId];
  }
}

function crmProxyFilter(req, res) {

  for (i = 0; i < messagedReq.length; i++) {
    var re = new RegExp(messagedReq[i][0]);
    if (new RegExp(messagedReq[i][0]).test(req.url) && messagedReq[i][1] == req.method) {
      console.log('Sending a message ...', req.url)
      var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      var requestId = randLetter + Date.now();

      // need lock here.
      requests[requestId] = [req, res];
      crmSns.publish(requestId);

      return;
    };
  }

  console.log('Proxy the request ...', req.url)
  proxy.web(req, res, {target: webServerAddress});
}

function startProxyServer(port, messageAll) {

  if (typeof(messageAll) === 'undefined') {
    messageAll = true;
  }

  var proxy = httpProxy.createProxyServer({});
  http.createServer(function (req, res) {
    if (messageAll) {
        console.log('Sending a message ...', req.url)
        var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        var requestId = randLetter + Date.now();

        // need lock here.
        requests[requestId] = [req, res];
        crmSns.publish(requestId);

    } else {
      crmProxyFilter(req, res);
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
