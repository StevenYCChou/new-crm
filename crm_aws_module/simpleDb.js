var AWS = require('aws-sdk');
var configs = require('../configs.js');
var simpledb = new AWS.SimpleDB({credentials: configs.simpleDb.creds, region: configs.simpleDb.region});

/*
 * Get single item attribute(s) from simbleDB.
 * @param itemName: item name defined in simpleDB. For example: 'productId'.
 * @parma attributes: 1) '*', retrieve all the attributes of the item.
 *                    2) [String], retrieve specified attributes.
 */
function getProductAttributes(itemName, attributes, callback) {
  var params = {
    DomainName: 'Product',
    ItemName: itemName,
    ConsistentRead: true || false,
  };

  if (attributes != '*')
    params['AttributeNames'] = attributes;

  simpledb.getAttributes(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, {
        productId: itemName,
        Attributes: data.Attributes,
      });
    }
  })
}

// TEST CODE.
/*
getProductAttributes('book-2', ['Category'], function(err, data) {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
  }
});

getProductAttributes('book-2', '*', function(err, data) {
  if (err) {
    console.log(err, err.stack);

  } else {
    console.log(data);
  }
});
*/

exports.getProductAttributes = getProductAttributes;
