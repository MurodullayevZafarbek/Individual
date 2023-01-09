const FormElement = require('../../model/form/form_element');
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(FormElement, req, res, next)
    result.createData()
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(FormElement, req, res, next)
    result.get_all("school")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(FormElement, req, res, next)
    result.get_one("school")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(FormElement, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(FormElement, req, res, next)
    result.delete_data_without_file()
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const result = await FormElement.find({
        $and: [
            { school: req.query.school },
            { form: req.query.form },
        ]
    })
    res.json({
        message: "Success",
        data: result
    })
});