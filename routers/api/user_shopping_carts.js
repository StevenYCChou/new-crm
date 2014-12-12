var api = require('../../api/user_shopping_carts.js');
var express = require('express');
var router = express.Router();

router.route('/:id')
  .get(api.getUserShoppingCart)
  .put(api.updateUserShoppingCart)
  .delete(api.clearUserShoppingCart);

module.exports = router;
