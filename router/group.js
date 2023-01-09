const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/group');

router.post('/create', controller.createData);
router.get('/all', controller.getAll);
router.get('/filter/room', controller.filted_2);
router.get('/filter/:id', controller.filted_1);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);



module.exports = router