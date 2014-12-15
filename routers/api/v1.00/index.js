var express = require('express');
var router = express.Router();

router.use('/entities/agents', require('./entities/agents.js'));
router.use('/entities/customers', require('./entities/customers.js'));
router.use('/entities/contact_records', require('./entities/contact_records.js'));
router.use('/entities/products', require('./entities/products.js'));
router.use('/entities/sessions', require('./entities/sessions.js'));
router.use('/entities/session_view_stats', require('./entities/session_view_stats.js'));
router.use('/entities/user_view_stats', require('./entities/user_view_stats.js'));
router.use('/entities/session_shopping_carts', require('./entities/session_shopping_carts.js'));
router.use('/entities/user_shopping_carts', require('./entities/user_shopping_carts.js'));
router.use('/entities/responses', require('./entities/responses.js'));

module.exports = router;