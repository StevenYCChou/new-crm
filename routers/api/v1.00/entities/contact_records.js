var api = require('../../../../api/contact_records.js');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(api.getContactRecords)
  .post(api.createContactRecord);

router.route('/:id')
  .get(api.getContactRecord)
  .put(api.updateContactRecord)
  .delete(api.removeContactRecord);

module.exports = router;
