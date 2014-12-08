var api = require('../../api.js');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(api.getCustomers)
  .post(api.createCustomer);

router.route('/:id')
  .get(api.getCustomer)
  .put(api.updateCustomer)
  .delete(api.removeCustomer);

module.exports = router;
