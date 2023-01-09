const Room = require("../../model/management/room");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Room, req, res, next)
    result.createData()
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Room, req, res, next)
    result.get_all("school")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Room, req, res, next)
    result.get_one("school")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Room, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Room, req, res, next)
    result.delete_data_without_file()
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const result = await Room
        .find({
            $and: [
                {
                    school: { $eq: req.params.id },
                    actions: { $eq: req.query.actions },
                }
            ]
        })
        .lean()
    res.json({
        message: "Success", data: result
    })
});
