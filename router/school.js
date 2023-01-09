const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/school');
const multer = require('multer')
const md5 = require('md5')
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/school')
    },
    filename: function (req, file, callback) {
        callback(null, `${md5(Date.now())}${path.extname(file.originalname)}`)
    }
})
const uploads = multer({ storage: storage })



router.post('/create', controller.createData);
router.get('/all', controller.getAll);
router.get('/findByName', controller.findOneShool);
router.get('/filter/:id', controller.filterData);
router.get('/manager/:id', controller.filterManager);
router.get('/:id', controller.getOne);
router.put('/logo/:id', uploads.array("image", 1), controller.setLogo);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);



module.exports = router