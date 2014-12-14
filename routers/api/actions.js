var express = require('express');
var router = express.Router();
var actions = require('../../api/actions.js');

router.put('/import_view_stats', actions.importViewStats);
router.put('/import_shopping_cart', actions.importShoppingCart)

module.exports = router;
