const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/lid');

router.post('/create', controller.createData);
router.get('/filter', controller.filterLid);
router.get('/special', controller.filterSpecial);
router.get('/date', controller.filterByDate);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);



module.exports = router