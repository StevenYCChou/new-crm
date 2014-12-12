var api = require('../../api/user_view_stats.js');
var express = require('express');
var router = express.Router();

router.route('/:id')
  .get(api.getUserViewStats)
  .put(api.incrUserViewStats)
  .delete(api.removeUserViewStats);

module.exports = router;
