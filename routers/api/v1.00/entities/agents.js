var api = require('../../../../api.js');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(api.getAgents)
  .post(api.createAgent);

router.route('/:id')
  .get(api.getAgent)
  .put(api.updateAgent)
  .delete(api.removeAgent);

module.exports = router;
