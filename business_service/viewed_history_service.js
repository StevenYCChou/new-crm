var redisService = require('../data_service/redis_service.js');
var sessionService = require('./session.js');
var redisClient = redisService.getRedisClient();

function getSessionViewedHistory(session, callback) {
  sessionService.getSessionContent(session, function (err, content) {
    if (err) {
      callback(err);
    } else {
      var multi = redisClient.multi();

      multi.hgetall(content.viewedProducts);
      multi.hgetall(content.viewedCategories);
    
      multi.exec(function(err, replies) {
        if (err) {
          callback(err);
        } else {
          callback(null, {
            sessionViewedProducts: replies[0],
            sessionViewedCategoies: replies[1],
          });
        }
      });
    }  
  })
}

function getUserViewedHistory(userId, callback) {
  var multi = redisClient.multi();

  multi.hgetall(userId + ':viewedProducts');
  multi.hgetall(userId + ':viewedCategories');

  multi.exec(function(err, replies) {
    if (err) {
      callback(err);
    } else {
      callback(null, {
        userViewedProducts: replies[0],
        userViewedCategoies: replies[1],
      });
    }
  });
}

function updateViewedHistory(session, update, callback) {
  sessionService.getSessionContent(session, function (err, content) {
    if (err) {
      callback(err);
    } else {
      var multi = redisClient.multi();

      updateSessionViewedHistory(multi, content.viewedProducts, content.viewedCategories, update); 

      if (content.userId != 'null')
        updateUserViewedHistory(multi, content.userId, update);

      multi.exec(function(err, replies) {
        if (err) {
          callback(err);
        } else {
          callback(null, replies);
        }
      })
    }
  });
}

function updateUserViewedHistory(multi, userId, update) {
  if (typeof update.product != "undefined")
    multi.hincrby(userId+':viewedProduct', update.product, 1);
    
  if (typeof update.categories != "undefined")
    update.categories.forEach(function(category) {
      multi.hincrby(userId+':viewedCategories', category, 1);
    })
}

function updateSessionViewedHistory(multi, viewedProducts, viewedCategories, update) {
  if (typeof update.product != "undefined")
    multi.hincrby(viewedProducts, update.product, 1);

  if (typeof update.categories != "undefined")
    update.categories.forEach(function(category) {
      // not to worry about new category. start from 0 for new feild.
      multi.hincrby(viewedCategories, category, 1);
    })
}

/*
session = "session:ufQF42GmfD7unumERXVCiVJV0mpS7p91";
update = {
  product: 'MR-CC-4',
  categories: ['Book', 'Music'],
}

updateViewedHistory(session, update, function (err, rep) {
  console.log("err\n" + err);
  console.log("rep\n" + rep);  
})

getSessionViewedHistory(session, function(err, rep) {
  console.log('err: ' + err);
  console.log(rep);
})
*/

exports.getSessionViewedHistory = getSessionViewedHistory;
exports.getUserViewedHistory = getUserViewedHistory;
exports.updateViewedHistory = updateViewedHistory;
