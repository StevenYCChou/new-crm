var express = require('express');
var router = express.Router();

router.put('/import_view_stats', require('../../api/actions/import_view_stats.js').importViewStats);

module.exports = router;
