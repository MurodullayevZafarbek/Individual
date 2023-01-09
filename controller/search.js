const User = require('../model/user')
const asyncHandler = require('../middleware/async');

exports.searchUser = asyncHandler(async (req, res, next) => {
    try {
        const { name } = req.query
        let userNames = new RegExp(name);
        const user = await User
            .find({
                role: {
                    $eq: "student"
                }
            })
            .or([
                { name: { $regex: userNames, $options: 'i' } },
                { passport: { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.surname": { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.father_name": { $regex: userNames, $options: 'i' } },
            ])
            .lean()
        res.json({
            success: true,
            data: user
        })
    }
    catch (error) {
        res.json({
            message: error.message
        })
    }
})


exports.searchUser_in_billings = asyncHandler(async (req, res, next) => {
    try {
        const { name } = req.query
        let userNames = new RegExp(name);
        const user = await User
            .find({
                role: {
                    $eq: "student"
                }
            })
            .or([
                { name: { $regex: userNames, $options: 'i' } },
                { passport: { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.nickname": { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.surname": { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.father_name": { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.telegram_username": { $regex: userNames, $options: 'i' } },
                { "additionalDocuments.address": { $regex: userNames, $options: 'i' } },
            ])
            .lean()
        res.json({
            success: true,
            data: user
        })
    }
    catch (error) {
        res.json({
            message: error.message
        })
    }
})
