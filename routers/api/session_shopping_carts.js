var api = require('../../api/session_shopping_carts.js');
var express = require('express');
var router = express.Router();

router.route('/:id')
  .get(api.getSessionShoppingCart)
  .put(api.updateSessionShoppingCart)
  .delete(api.clearSessionShoppingCart);

module.exports = router;
