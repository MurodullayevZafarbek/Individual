const Speciality = require('../model/speciality');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Speciality, req, res, next)
    result.createData()
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Speciality, req, res, next)
    result.get_all("category")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Speciality, req, res, next)
    result.get_one("category")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Speciality, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Speciality, req, res, next)
    result.delete_data_without_file()
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Speciality, req, res, next)
    result.filterById("category")
});