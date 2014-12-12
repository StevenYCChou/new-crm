var api = require('../../api/session_view_stats.js');
var express = require('express');
var router = express.Router();

router.route('')
  .get(api.getSessionViewStats)
  .put(api.incrSessionViewStats)
  .delete(api.removeSessionViewStats);

module.exports = router;
