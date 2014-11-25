var crmRabbitmqConnection = require('./rabbitmq_connection.js');

/* Consumer:
 * {exchange: exchangeName, queue: queue: type: type: routingKey: routingKey, callback: callback}
 */
function startConsumers(consumers) {
  crmRabbitmqConnection.getRabbitmqConnection(function(conn) {
    consumers.forEach(function(consumer) {
      bindConsumer(conn, consumer.exchange, consumer.queue,
        consumer.type, consumer.routingKey, consumer.callback);
    });
  });
}

function bindConsumer(conn, exchangeName, queueName, type, routingKey, callback) {
  var exchange = {
    name: exchangeName,
    opts: { durable: true, type: type, autoDelete: false}
  };

  var queue = {
    name: queueName,
    opts: { exclusive: false, durable: true, autoDelete: false}
  };

  var ex = conn.exchange(exchange.name, exchange.opts, function(ex) {
    var q = conn.queue(queue.name, queue.opts, function(q) {
      q.on('queueBindOk', function() {
        q.subscribe(callback);
      });
      q.bind(ex.name, routingKey);
    });
  });
}

function publishMessage(exchangeName, msg, routingKey) {
  crmRabbitmqConnection.getRabbitmqConnection(function(conn) {
    var exchange = {
      name: exchangeName,
      opts: { durable: true, type: 'topic', autoDelete: false}
    };
    var ex = conn.exchange(exchange.name, exchange.opts, function(ex) {
      ex.publish(routingKey, msg, {deliveryMode: 1});
    });
  });
}

exports.startConsumers = startConsumers;
exports.publishMessage = publishMessage;
