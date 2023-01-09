const Task = require("../../model/task/taskChild");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async')
const ObjectId = require('mongodb').ObjectId;

exports.filtering = asyncHandler(async (req, res, next) => {
    const result = await Task
        .find({ task: req.params.id })
        .populate(["school"])
        .populate(["task"])
        .populate(["members"])
        .lean()
    res.json({
        message: "Success",
        data: result
    })
});
exports.taskStaff = asyncHandler(async (req, res, next) => {
    const { school, task, members } = req.query
    const result = await Task
        .find({
            $and: [
                { school: { $eq: ObjectId(school) } },
                { task: { $eq: ObjectId(task) } },
                { members: { $eq: ObjectId(members) } },
            ]
        })
        .populate(["school"])
        .populate(["task"])
        .populate(["members"])
        .lean()
    res.json({
        message: "Success",
        data: result
    })
});


exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Task, req, res, next)
    result.get_one("school", "task", "members")
});
exports.updateFiles = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(Task, req, res, next)
        result.update_file("documents", "documents")
    }
})
exports.updateContext = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(Task, req, res, next)
        result.update_content()
    }
})
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Task, req, res, next)
    result.delete_data_with_file("documents", "documents")
});


