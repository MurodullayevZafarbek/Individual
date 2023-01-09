const Group = require('../model/group');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async');
const { ObjectId } = require('mongodb');

exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Group, req, res, next)
    result.createData()
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Group, req, res, next)
    result.get_all("school", "category", "speciality", "room")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Group, req, res, next)
    result.get_one("school", "category", "speciality", "room")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Group, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Group, req, res, next)
    result.delete_data_without_file()
});
exports.filted_1 = asyncHandler(async (req, res, next) => {
    const result = await Group.find({
        $and: [
            {
                school: { $eq: req.params.id },
                actions: { $eq: req.query.actions },
            }
        ]
    }).lean()
    res.json({
        message: "Success", data: result
    })

});
exports.filted_2 = asyncHandler(async (req, res, next) => {
    const result = await Group
        .find({
            $and: [
                {
                    school: new ObjectId(req.query.school)
                },
                {
                    room: new ObjectId(req.query.room)
                },
                {
                    actions: { $eq: req.query.actions },
                }
            ]
        })
        .populate({ path: "speciality", select: "name" })
        .lean()
    res.json({
        message: "Success",
        data: result
    })
});



