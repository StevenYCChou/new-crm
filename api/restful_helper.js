var Qs = require('qs');

var getLink = function (endpoint, offset, limit, query, field) {
  var link_constraints = {
    offset: offset,
    limit: limit,
    q: query,
    field: field
  }
  var query_string = Qs.stringify(link_constraints);
  if (query_string === "") {
    return endpoint;
  } else {
    return endpoint+'?'+Qs.stringify(link_constraints);
  }
};

exports.constructLinks = function(endpoint, offset, limit, original_query, field, collectionSize) {
  var query_string;
  if (original_query) {
    query_string = Qs.stringify(original_query, { delimiter: ',' });
  }
  var res = [];
  if (limit != 0) {
    res[res.length] = {rel: "first", href: getLink(endpoint, 0, limit, query_string, field)};
    res[res.length] = {rel: "last", href: getLink(endpoint, collectionSize - limit, limit, query_string, field)};
    if (offset > 0 &&
        collectionSize != limit) {
      var prev_offset = (offset >= limit) ? (offset - limit) : 0;
      res[res.length] = {rel: "prev", href: getLink(endpoint, prev_offset, limit, query_string, field)};
    }
    if (offset >= 0 &&
        offset + limit < collectionSize &&
        collectionSize != limit) {
      var next_offset = offset + limit;
      res[res.length] = {rel: "next", href: getLink(endpoint, next_offset, limit, query_string, field)};
    }
  }
  return res;
}

exports.responsePollingPage = function(res, uuid) {
  res.json({
    links: {
      rel: 'poll',
      href: '/api/v1.00/entities/responses/' + uuid
    }
  });
}

exports.getMongooseFields = function (fields) {
  var fields_obj = {};
  fields.forEach(function(field) {
    fields_obj[field] = 1;
  });
  return fields_obj;
};