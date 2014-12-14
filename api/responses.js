var mongodbService = require('../data_service/mongodb_service.js');
var Promise = require('promise');
var restfulHelper = require('./restful_helper.js');

exports.getResponse = function(req, res) {
  var id = req.params.id;
  console.log(id);
  var query = mongodbService.Response.findOne({nonce: id});
  var promise = query.exec();

  promise.then(function(response) {
    var data = response.toJSON();
    data._type = 'response';
    
    var links = [{
      rel: "self",
      href: "/api/v1.00/entities/responses/"+id
    }];
    res.json({
      data: data,
      links: links
    });
  }, function(err) {
    res.status(404).end();
  });
};
