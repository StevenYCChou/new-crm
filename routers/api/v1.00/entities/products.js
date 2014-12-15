var api = require('../../../../api.js');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(api.getProducts)
  .post(api.createProduct);

router.route('/:id')
  .get(api.getProduct)
  .put(api.updateProduct)
  .delete(api.removeProduct);

module.exports = router;
