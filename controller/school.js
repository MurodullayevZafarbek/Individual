const School = require('../model/school');
const MyClass = require('../config/class');
const asyncHandler = require('../middleware/async');
const { DEFAULT_TIME, JWT_KEY } = require('../config/default');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.createData = asyncHandler(async (req, res, next) => {

    const candidate = await School.findOne().sort({ createdAt: -1 });
    const numbers = candidate ? candidate.code + 1 : 10000;

    function arrayFunction(elements) {
        const array_element = [];
        for (let element of elements) {
            const values = element;
            array_element.push(values)
        }
        return array_element
    }
    const school = new School({
        region: req.body.region,
        district: req.body.district,
        manager: req.body.manager,
        category: arrayFunction(req.body.category),
        name: req.body.name,
        phone: req.body.phone,
        code: numbers,
        school_descrtiption: arrayFunction(req.body.school_descrtiption),
    })

    school.save()
        .then(() => {
            res.json({
                message: "Success", data: school
            })
        })
        .catch((error) => {
            res.json(error)
        })
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(School, req, res, next)
    result.get_all("region", "district", "category")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(School, req, res, next)
    result.get_one("region", "district", "category")
});
exports.findOneShool = asyncHandler(async (req, res, next) => {
    const result = await School.findOne({
        $and: [
            {
                subDomain: { $eq: req.query.name },
                actions: { $eq: req.query.actions },
            }
        ]
    })
        .populate(['region'])
        .populate(['district'])
        .populate(['category'])
        .lean()
    res.json({
        success: true, data: result
    })
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(School, req, res, next)
    result.update_content()
});
exports.setLogo = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(School, req, res, next)
        result.update_file(
            "image", // model property name
            "school" // upload folder name
        )
    }
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(School, req, res, next)
    result.delete_data_without_file()
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(School, req, res, next)
    result.filterById("district")
});
exports.filterManager = asyncHandler(async (req, res, next) => {
    const result = await School.find({
        $and: [
            {
                manager: { $eq: req.params.id },
                actions: { $eq: req.query.actions },
            }
        ]
    })
    res.json({
        message: "Success", data: result
    })
});
