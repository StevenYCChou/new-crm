var AWS = require('aws-sdk');
var configs = require('../configs.js');

var ses = new AWS.SES({credentials: configs.awsSqs.creds, region: configs.awsSqs.region});

function sendEmail(from, to, cc, subject, message, callback) {
  var params = {
    Destination: {
      CcAddresses: cc,
      ToAddresses: to,
    },
    Message: {
      Body: {
        Html: {
          Data: message,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: from,
  };

  ses.sendEmail(params, function(err, data) {
    if (err) callback(err);
    else callback(null);
  });
};

//sendEmail('wx2148@columbia.edu', ['wx2148@columbia.edu'], [], '[TEST]', 'HI', function(err) {console.log(err)});

exports.sendEmail = sendEmail;
