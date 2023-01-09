const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../../middleware/auth')
const controller = require('../../controller/task/taskMain');

router.post('/create', controller.createData);
router.get('/all', controller.getAll);
router.get('/filter', controller.filtering);
router.get('/staff', controller.taskStaff);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);



module.exports = router