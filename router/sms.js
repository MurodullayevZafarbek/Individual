const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/sms');

router.post('/send', controller.sendSMS);
router.post('/check', controller.checkSMS);
router.post('/create', controller.createData);
router.get('/filterSMS', controller.filterSMS);
router.get('/1', controller.filter_1);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

module.exports = router