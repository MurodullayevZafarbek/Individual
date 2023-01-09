const Form = require('../../model/form/form');
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async')
const { v4: uuidv4 } = require('uuid');


exports.createData = asyncHandler(async (req, res, next) => {
    const { school, name } = req.body;
    const result = new Form({
        school: school,
        name: name,
        url: uuidv4(),
    })
    result.save()
        .then(() => { res.json({ message: "Success", data: result }) })
        .catch((error) => { res.json({ message: "Error", data: error.message }) })
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Form, req, res, next)
    result.get_all("school")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Form, req, res, next)
    result.get_one("school")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Form, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Form, req, res, next)
    result.delete_data_without_file()
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const result = await Form.find({
        $and: [
            { school: req.query.school },
            { actions: req.query.actions },
        ]   
    })
    res.json({
        message: "Success",
        data: result
    })
});