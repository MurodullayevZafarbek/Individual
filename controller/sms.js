const axios = require('axios')
const { smsCategory, sentSms } = require('../model/sms')
const { smsSend } = require("../config/sms")
const User = require('../model/user')
const School = require('../model/school')
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')
const ObjectId = require('mongodb').ObjectId


exports.sendSMS = asyncHandler(async (req, res, next) => {
    const { school, member, sms, status, senderID, senderNAME, role } = req.body;
    if (school == "" || member == "" || sms == "" || senderID == "" || senderNAME == "" || role == "" || status == "") {
        res.json({ message: "Ma'lumotni to'liq kiriting" })
    }
    else {
        const schools = await School.findById(school);
        if (schools.sms.status == "0" && schools.sms.sms_email == "none" && schools.sms.sms_token == "none") {
            res.json({ message: "SMS tizimi ulanmagan" })
        }
        else {
            let counting = 0
            for (let mem of member) {
                const telephone = mem.phone
                const email = schools.sms.sms_email;
                const password = schools.sms.sms_token;
                const message = sms.replace("@name", mem.username)
                smsSend(telephone, message, email, password)
                const result = new sentSms({
                    school: school,
                    userID: mem.userID,
                    username: mem.username,
                    phone: telephone,
                    message: message,
                    status: status,
                    senderID: senderID,
                    sendername: senderNAME,
                    userrole: role
                })
                result.save()
                console.log(`"${mem.username}" ga sms jo'natildi`, counting += 1)
            }
            res.json({ message: "Success" })
        }
    }
})
exports.checkSMS = asyncHandler(async (req, res, next) => {
    axios({
        method: "POST",
        url: "http://notify.eskiz.uz/api/auth/login",
        data: {
            email: req.body.email,
            password: req.body.password,
        }
    })
        .then((response) => {
            const data = response.data.message
            res.json({ message: data })
        })
        .catch((error) => {
            res.json({
                message: error.message
            })
        })
})
exports.createData = asyncHandler(async (req, res, next) => {
    const result = new MyClass(smsCategory, req, res, next)
    result.createData()
});
exports.filter_1 = asyncHandler(async (req, res, next) => {
    const { school, actions } = req.query;
    if (school == "" || !school) res.json({ message: "Error" })
    const result = await smsCategory.find({
        $and: [
            { school: { $eq: school } },
            { actions: { $eq: actions } },
        ]
    }).sort({ createdAt: -1 })
    res.json({ message: "Success", data: result })
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(smsCategory, req, res, next)
    result.get_one()
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(smsCategory, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(smsCategory, req, res, next)
    result.delete_data_without_file()
});
exports.filterSMS = asyncHandler(async (req, res, next) => {
    const { school, userrole, status, actions } = req.query;
    const result = await sentSms
        .find({
            $and: [
                { school: { $eq: ObjectId(school) } },
                { userrole: { $eq: userrole } },
                { status: { $eq: status } },
                { actions: { $eq: actions } },
            ]
        })
        .sort({ createdAt: -1 })
        .populate({ path: "school", select: "name" })
        .populate({ path: "userID", select: "name" })
        .populate({ path: "senderID", select: "name" })
        .lean()
    res.json({
        message: "Success",
        data: result
    })
}) 

