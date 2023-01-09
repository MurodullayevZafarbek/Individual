const Lid = require('../model/lid');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    function arrayFunction(elements) {
        const array_element = [];
        for (let element of elements) {
            const values = element;
            array_element.push(values)
        }
        return array_element
    }
    const school = new Lid({
        region: req.body.region,
        district: req.body.district,
        school: req.body.school,
        category: req.body.category,
        speciality: req.body.speciality,
        week: arrayFunction(req.body.week),
        free_start_time: req.body.free_start_time,
        free_end_time: req.body.free_end_time,
        username: req.body.username,
        phone: req.body.phone,
        status: req.body.status,
        gender: req.body.gender,
        another_phone: req.body.another_phone,
        open_couse: req.body.open_couse,
        birthday: req.body.birthday,
        howKnown: arrayFunction(req.body.howKnown),
        lid_type: req.body.lid_type,
        lessonType: req.body.lessonType,
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
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Lid, req, res, next)
    result.get_one("category", "speciality", "school", "region", "district")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Lid, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Lid, req, res, next)
    result.delete_data_without_file()
});
exports.filterLid = asyncHandler(async (req, res, next) => {
    const { status, school, actions } = req.query
    await Lid
        .find({
            $and: [
                status == "0" ? {} : { status: { $eq: status } },
                { school: { $eq: school } },
                { actions: { $eq: actions } },
            ]
        })
        .populate({ path: "school", select: "name" })
        .populate({ path: "region", select: "name" })
        .populate({ path: "district", select: "name" })
        .populate({ path: "speciality", select: "name" })
        .populate({ path: "speciality", select: "name" })
        .sort({ createdAt: -1 })
        .exec((error, data) => {
            if (error) res.json({ message: "Malumot topilmadi" })
            else res.json({ message: "Malumot muvaffaqiyatli olindi", data: data })
        })
})
exports.filterSpecial = asyncHandler(async (req, res, next) => {
    const { status, school, actions, category, speciality } = req.query
    await Lid
        .find({
            $and: [
                { status: { $eq: status } },
                { school: { $eq: school } },
                { category: { $eq: category } },
                { speciality: { $eq: speciality } },
                { actions: { $eq: actions } },
            ]
        })
        .populate({ path: "school", select: "name" })
        .populate({ path: "region", select: "name" })
        .populate({ path: "district", select: "name" })
        .populate({ path: "speciality", select: "name" })
        .populate({ path: "speciality", select: "name" })
        .sort({ createdAt: -1 })
        .exec((error, data) => {
            if (error) res.json({ message: "Malumot topilmadi" })
            else res.json({ message: "Malumot muvaffaqiyatli olindi", data: data })
        })
})
exports.get_by_advertisement = asyncHandler(async (req, res, next) => {
    await Lid
        .find({
            $and: [
                { howKnown: { $eq: req.query.howKnown } },
                { school: { $eq: req.query.school } },
                { actions: { $eq: actions } },
            ]
        })
        .populate("school")
        .populate("category")
        .populate("speciality")
        .populate("region")
        .populate("district")
        .sort({ createdAt: -1 })
        .exec((error, data) => {
            if (error) res.json({ message: "Malumot topilmadi" })
            else res.json({ message: "Malumot muvaffaqiyatli olindi", data: data })
        })
})
exports.filterByDate = asyncHandler(async (req, res, next) => {
    const result = await Lid
        .find({
            $and: [
                { school: { $eq: req.query.school } },
                { status: { $eq: req.query.status } },
            ]
        })
        .sort({ createdAt: -1 })
        .lean()
    const resp = result
        .map((item) => {
            return {
                _id: item._id,
                username: item.username,
                lessonType: item.lessonType,
                lid_type: item.lid_type,
                phone: item.phone,
                status: item.status,
                createdAt: new Date(item.createdAt).toLocaleDateString()
            }
        })
        .filter((item) => {
            const onlineServer = item.createdAt.split("/")[0] // online serverni o'zida olish
            const offlineServer = item.createdAt.split(".")[1] // localhostni o'zida olish

            return onlineServer == req.query.month
        })

    console.log(resp)


    res.json({
        status: true,
        count: resp.length,
        data: resp
    })



});
