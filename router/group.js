const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/group');

router.post('/create', controller.createData);
router.get('/all', controller.getAll);
router.get('/filter/room', controller.filted_2);

function qwe(req, res, next) {
    if (req.query.qwe == "da") {
        checkToken(req, res, next)
    } else {
        next()
    }
}
router.get('/filter/:id', qwe, controller.filted_1);

router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);



module.exports = router