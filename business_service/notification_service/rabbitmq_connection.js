var amqp = require('amqp');
var configs = require('../../configs.js');

var rabbitmqConn;

function getRabbitmqConnection(callback) {
  var rabbitmqUrl = configs.rabbitMq.server_address;

  if (rabbitmqConn) {
    callback(rabbitmqConn);
  } else {
    console.log("Starting rabbitmq... URL: " + rabbitmqUrl);
    var conn = amqp.createConnection({ url: rabbitmqUrl });
    conn.on('ready', function() {
      rabbitmqConn = conn;
      callback(rabbitmqConn);
    })
    conn.on('error', function(err) {
        console.trace();
        console.log(err);
    });
    conn.on('closed', function() {
      rabbitmqConn = null;
    })
  }
}

exports.getRabbitmqConnection = getRabbitmqConnection;
