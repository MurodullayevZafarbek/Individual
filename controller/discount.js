const Discount = require('../model/discount');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')
const ObjectId = require('mongodb').ObjectId

exports.createData = asyncHandler(async (req, res, next) => {
    const {
        userID,
        status,
        percentage,
        groupID,
        categoryID,
        specialityID,
    } = req.body;
    if (!userID || !status || !percentage || !groupID || !categoryID || !specialityID) {
        res.json({
            message: "Malumotlarni to'liq kiriting"
        })
    }
    else {
        const discounts = await Discount.find({
            $and: [
                { user: { $eq: userID } },
                { group: { $eq: groupID } },
                { category: { $eq: categoryID } },
                { speciality: { $eq: specialityID } },
            ]
        })
        if (discounts == "" || discounts.length == 0) {
            const result = new Discount({
                status: status,
                user: userID,
                group: groupID,
                category: categoryID,
                speciality: specialityID,
                percentage: percentage,
            })
            result.save()
                .then(() => {
                    res.json({
                        message: "Success",
                        data: result
                    })
                })
                .catch((error) => {
                    res.json({
                        message: "Duplicated",
                        data: error.message
                    })
                })
        }
        else {
            res.json({
                message: "Error"
            })
        }
    }
});
exports.userOwnDiscount = asyncHandler(async (req, res, next) => {
    const { actions } = req.query
    const { id } = req.params
    const data = await Discount.find({ $and: [{ user: { $eq: id } }, { actions: { $eq: actions } }] })
    .populate({ path: "group", select: ["name", "payment"] })
    .populate({ path: "category", select: "name" })
    .populate({ path: "speciality", select: "name" })

    res.json({
        success: true,
        data: data
    })
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Discount, req, res, next)
    result.get_one()
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Discount, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Discount, req, res, next)
    result.delete_data_without_file()
});