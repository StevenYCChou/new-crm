var api = require('../../../../api/responses.js');
var express = require('express');
var router = express.Router();

router.route('/:id').get(api.getResponse);

module.exports = router;
