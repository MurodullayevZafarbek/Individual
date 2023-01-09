const Union = require('../model/union');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Union, req, res, next)
    result.createData()
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Union, req, res, next)
    result.get_all()
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Union, req, res, next)
    result.get_one()
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Union, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Union, req, res, next)
    result.delete_data_without_file()
});