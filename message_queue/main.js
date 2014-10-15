var http = require('http');
var httpProxy = require('http-proxy');

var AWS = require('aws-sdk');

// setup AWS and SQS
configs = require('../configs.js');
var sqs = new AWS.SQS({ credentials: configs.creds, region: configs.region });

var proxy = httpProxy.createProxyServer();
// TODO: Not hardcode here. Need to import from config.js.
var webServerAddress = 'http://localhost:3000';


// GLOBAL
var requests = {};


// get the Queue URL and start handlers
console.log('Getting Queue URL...');
sqs.getQueueUrl( {QueueName: configs.reqQueue}, function(err, data) {

    if (err) {
        console.log(err, err.stack);
        return;
    }

   if (data.QueueUrl) {
        console.log('Got Queue URL: '+data.QueueUrl);

//        console.log('Starting HTTP server...');
//        startHttpServer(data.QueueUrl);

        console.log('Starting proxy server...');
        startProxyServer(data.QueueUrl);

        console.log('Starting Queue handler...');
        processing = setInterval(function(){
            processQueue(data.QueueUrl);
        }, 5000);
    }

})

function processQueue(url) {
    console.log('Checking Queue...');
    sqs.receiveMessage({QueueUrl:url}, function(err, data){
        if (data.Messages) {

            data.Messages.forEach(function(item) {

                var requestId = item.Body;
                if (requestId in requests) {
                    // req, res
                    proxy.web(requests[requestId][0], requests[requestId][1], {target: webServerAddress});

                    delete requests[requestId];
                }
            });


            console.log('Got a message from the Queue!');
            // then delete them (need to convert into params object first)
            var toDelete = [];
            data.Messages.forEach(function(item) {
                toDelete.push( { Id: item.MessageId, ReceiptHandle: item.ReceiptHandle} );
            });

            console.log('Deleting message from Queue...');

            sqs.deleteMessageBatch({ QueueUrl: url, Entries: toDelete }, function(err, data) {
                console.log(err); console.log(data);
            });
        }
    });


}


function startProxyServer(url) {
    var proxy = httpProxy.createProxyServer({});
    http.createServer(function (req, res) {

        var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        var requestId = randLetter + Date.now();

        // need lock here.
        requests[requestId] = [req, res];

        sqs.sendMessage({ QueueUrl: url, MessageBody: requestId }, function(err, data) {
            messageId = data.MessageId;
            if (err) {
                console.log(err);
            }
        });

    }).listen(8888);
}

// test server
function startHttpServer() {
    http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
      res.end();
    }).listen(9000);

}
