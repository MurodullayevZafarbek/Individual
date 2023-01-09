const taskMain = require("../../model/task/taskMain");
const User = require("../../model/user");
const taskChild = require("../../model/task/taskChild");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async');
const ObjectId = require('mongodb').ObjectId;


exports.createData = asyncHandler(async (req, res, next) => {
    const { task, school, members, startDate, endDate, status } = req.body;
    if (task == "" || school == "" || members == "" || startDate == "" || endDate == "" || status == "") {
        res.json({ message: "Malumotni to'liq kiriting" })
    } else {

        const members_all = []
        for (const iterator of members) {
            const values = iterator;
            members_all.push(values)
        }

        const task_mains = new taskMain({
            task: task,
            school: school,
            members: members_all,
            startDate: startDate,
            endDate: endDate,
            status: status,
        })

        await task_mains.save()
            .then((res) => {
                members_all.forEach(async (userID) => {
                    const users = await User.findById(userID).select("name").lean()

                    const task_childs = new taskChild({
                        school: school,
                        task: task_mains._id,
                        members: userID,
                        username: users.name,
                        startDate: startDate,
                        endDate: endDate,
                    })

                    task_childs.save()
                });
                res.json({ message: "Success", data: task_mains })
            })
            .catch((error) => {
                res.json({ message: "Failed", data: error })
            })
    }
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(taskMain, req, res, next)
    result.get_all("school", "group", "members")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(taskMain, req, res, next)
    result.get_one("school", "group", "members")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(taskMain, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    await taskChild.deleteMany({ task: req.params.id }).exec(async (error) => {
        if (error) {
            res.json({
                message: "Malumot o'chirishda xatolik mavjud - 1",
                data: error
            })
        } else {
            await taskMain.findByIdAndDelete({ _id: req.params.id }).exec((error) => {
                if (error) {
                    res.json({
                        message: "Malumot o'chirishda xatolik mavjud - 2",
                        data: error
                    })
                } else {
                    res.json({
                        message: "Malumot o'chirildi",
                        data: []
                    })
                }
            })
        }
    })
});

// Faqat aktiv bolgan topshiriqlarni olish
exports.filtering = asyncHandler(async (req, res, next) => {
    const { school, actions, status } = req.query;
    if (school == "" || actions == "" || status == "") {
        res.json({ message: "Ma'lumotlarni to'liq kiriting" })
    }
    else {
        const result = await taskMain
            .find({ $and: [{ school: { $eq: school } }, { actions: { $eq: actions } }, { status: { $eq: status } }] })
            .sort({ createdAt: -1 })
            .populate({ path: "school", select: "name" })
            .populate({ path: "members", select: "name" })
        res.json({ message: "Success", data: result })
    }
});


// Xodim o'ziga tegishli vazofani olish
exports.taskStaff = asyncHandler(async (req, res, next) => {
    const { school, actions, status, members } = req.query;
    if (school == "" || actions == "" || status == "") {
        res.json({ message: "Ma'lumotlarni to'liq kiriting" })
    }
    else {
        const result = await taskMain
            .find({
                $and: [
                    { members: { $eq: ObjectId(members) } },
                    { school: { $eq: ObjectId(school) } },
                    { actions: { $eq: actions } }, // active/archive
                    { status: { $eq: status } }    // admin/seller/mentor
                ]
            })
            .sort({ createdAt: -1 })
            .populate({ path: "school", select: "name" })
            .populate({ path: "members", select: "name" })
        res.json({ message: "Success", data: result })
    }
});