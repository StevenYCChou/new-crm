var api = require('../../../../api/sessions.js');
var express = require('express');
var router = express.Router();

router.route('/:id')
  .get(api.getSession)
  .put(api.updateSession)
  .delete(api.removeSession);

module.exports = router;
