const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../../middleware/auth')
const controller = require('../../controller/management/attendance');

router.post('/create', controller.createData);
router.get('/all', controller.getAll);
router.get('/filter', controller.filter_all);
router.get('/filter_by_user', controller.filter_by_user);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

module.exports = router