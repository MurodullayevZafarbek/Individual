const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/user');
const multer = require('multer')
const md5 = require('md5')
const path = require('path')

const uploads = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './public/user')
        },
        filename: function (req, file, callback) {
            callback(null, `${md5(Date.now())}${path.extname(file.originalname)}`)
        }
    })
})

const excelFile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './public/excel')
        },
        filename: function (req, file, callback) {
            callback(null, `${md5(Date.now())}${path.extname(file.originalname)}`)
        }
    })
})

router.post('/create', controller.register);
router.post('/login', controller.login);
router.post('/by_excel', excelFile.single("excel"), controller.by_excel);
router.get('/decode', controller.decodeToken);
router.get('/get_by_role', controller.get_by_role);
router.get('/get_by_school_group', controller.filter_user_school_and_group);
router.get('/logout', controller.logout);
router.get('/filter_user', controller.filter_user);
router.get('/filter_by_group', controller.filter_by_group);
router.get('/:id', controller.getOne);
router.put('/own/brand/:id', uploads.array("image", 12), controller.changeOwnLogoBrand)
router.put('/image/:id', uploads.array("image", 12), controller.updateFile)
router.put('/content/:id', controller.updateMe)
router.delete('/:id', controller.deleteData)

module.exports = router






