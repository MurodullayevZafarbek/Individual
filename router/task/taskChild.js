const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../../middleware/auth')
const controller = require('../../controller/task/taskChild');
const multer = require('multer')
const md5 = require('md5')
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/documents')
    },
    filename: function (req, file, callback) {
        callback(null, `${md5(Date.now())}${path.extname(file.originalname)}`)
    }
})
const uploads = multer({ storage: storage })

router.get('/staff', controller.taskStaff);
router.get('/filter/:id', controller.filtering);
router.get('/:id', controller.getOne);
router.put('/documents/:id', uploads.array("documents", 12), controller.updateFiles)
router.put('/contexts/:id', controller.updateContext)
router.delete('/:id', controller.deleteOne);



module.exports = router