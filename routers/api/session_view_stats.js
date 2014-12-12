var api = require('../../api/session_view_stats.js');
var express = require('express');
var router = express.Router();

router.route('/:id')
  .get(api.getSessionViewStats)
  .put(api.updateSessionViewStats)
  .delete(api.removeSessionViewStats);

module.exports = router;
