const Notification = require('../model/notification');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Notification, req, res, next)
    result.createData()
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Notification, req, res, next)
    result.get_all("userID")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Notification, req, res, next)
    result.get_one("userID")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Notification, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Notification, req, res, next)
    result.delete_data_without_file()
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const result = await Notification
        .find({
            $and: [
                { userID: { $eq: req.query.userID } },
                { status: { $eq: req.query.status } },
            ]
        })
        .sort({ createdAT: -1 })
        .lean()

    res.json({
        success: true,
        count: result.length,
        data: result
    })
});