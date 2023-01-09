const User = require('../model/user');
const Group = require('../model/group');
const bcrypt = require('bcryptjs');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async')
const JWT = require('jsonwebtoken')
const { DEFAULT_TIME, JWT_KEY } = require('../config/default')
const ObjectId = require('mongodb').ObjectId
const fs = require('fs');
const path = require("path")
const XLSX = require('xlsx')
const { v4: uuidv4 } = require('uuid');

exports.by_excel = asyncHandler(async (req, res, next) => {
    const { region, district, school, group, start, end } = req.body;
    const { filename } = req.file;
    if (region == "" || district == "" || school == "" || group == "" || filename == "" || start == "" || end == "") res.json({ message: "Hamma malumotlarni kiriting" })
    else {
        const fileType = path.extname(filename)
        if (fileType == ".xlsx") {
            if (parseInt(start) == 0) res.json({ message: "Not start zero" })
            if (parseInt(start) > parseInt(end)) res.json({ message: "Starter is more than Last number" })
            else {
                try {



                    const workbook = XLSX.readFile(`./public/excel/${filename}`)
                    const workSheet = workbook.Sheets[workbook.SheetNames[0]]
                    const data = []
                    const countingsCheck = []
                    const checkDatas = []
                    for (let index = parseInt(start) + 1; index <= parseInt(end) + 1; index++) {
                        if (index) {
                            const name = workSheet[`A${index}`]
                            const password = workSheet[`B${index}`]
                            const phone = workSheet[`C${index}`]
                            const additionalPhone = workSheet[`D${index}`]
                            const gender = workSheet[`E${index}`]
                            const birthday = workSheet[`F${index}`]

                            if (name && password && phone && additionalPhone && gender && birthday) {
                                // Passport raqam yaratish
                                const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
                                const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "C", "T", "U", "W", "X", "Y", "Z"]
                                const randomPassportNumber = (data) => {
                                    const index = Math.floor(Math.random() * data.length)
                                    return data[index]
                                }
                                const randomPassportLetters = (data) => {
                                    const index = Math.floor(Math.random() * data.length)
                                    return data[index]
                                }
                                const newPassport = randomPassportLetters(letters) + randomPassportLetters(letters) +
                                    randomPassportNumber(numbers) + randomPassportNumber(numbers) + randomPassportNumber(numbers) + randomPassportNumber(numbers) +
                                    randomPassportNumber(numbers) + randomPassportNumber(numbers) + randomPassportNumber(numbers)

                                const user = new Object({
                                    region: region,
                                    district: district,
                                    school: school,
                                    group: group,
                                    name: name.v,
                                    phone: phone.v,
                                    password: password.v,
                                    additionalDocuments: {
                                        born_date: birthday.v,
                                        another_phone: additionalPhone.v,
                                    },
                                    passport: newPassport,
                                    gender: gender.v,
                                    role: "student",
                                    status_default: "none",
                                })
                                data.push(user)
                            }
                            else {
                                checkDatas.push(false)
                            }
                        }
                    }
                    // Bir xil passport malumot chiqib qolmaslik uchun tekshirish

                    if (checkDatas.includes(false)) {
                        res.json({
                            message: "Excel's row and column need to fill up"
                        })
                    } else {
                        const USERS = await User.find().select("passport").lean()

                        USERS.forEach(async (user) => {
                            data.forEach(async (data) => {
                                const userPassport = user.passport;
                                const dataPassport = data.passport;
                                if (userPassport == dataPassport) countingsCheck.push(false)
                                else countingsCheck.push(true)
                            })
                        })
                        if (countingsCheck.includes(false)) {
                            res.json({
                                message: "Duplicated"
                            })
                        }
                        else {
                            data.forEach((item) => {
                                const new_user = new User({
                                    region: region,
                                    district: district,
                                    school: school,
                                    group: group,
                                    name: item.name,
                                    phone: item.phone,
                                    password: item.password,
                                    uuid: uuidv4(),
                                    additionalDocuments: {
                                        born_date: item.additionalDocuments.born_date,
                                        another_phone: item.additionalDocuments.another_phone
                                    },
                                    passport: item.passport,
                                    gender: item.gender,
                                    role: "student",
                                    status_default: "none",
                                })
                                new_user.save()
                            })
                            res.json({
                                message: "Success",
                            })
                        }
                    }

                    const directory = './public/excel'
                    fs.readdir(directory, (err, files) => {
                        if (err) console.log({ message: "Excel uchun papkani topaolmayapti" });
                        for (const file of files) {
                            fs.unlink(path.join(directory, file), (err) => {
                                console.log("Excel fayl o'chirildi", file)
                            });
                        }
                    });
                }
                catch (error) {
                    res.json({ message: error.message })
                }
            }
        } else {
            res.json({ message: "not_file" })
        }
    }
});
exports.register = asyncHandler(async (req, res, next) => {
    const result = new MyClass(User, req, res, next)
    result.createData()
});
exports.login = asyncHandler(async (req, res, next) => {
    const { passport, password } = req.body;
    if (!passport || !password || passport == "" || password == "") {
        res.json({ success: false, message: "Please provide email or password" });
    } else {
        const foundUser = await User.find({ passport: passport }).lean()
        const user = foundUser[0]
        if (!user || user == null || user == "" || user == undefined || user == false) {
            res.json({
                status: false,
                message: "Passport invalid"
            });
        }
        else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch || isMatch == false) {
                res.json({
                    status: false,
                    message: "Password invalid"
                });
            } else {
                // generate session
                const session = req.session;
                session.name = user.name;
                session.role = user.role;
                session.status = user.status_default;
                session.block_start = user.blocking_start_date;
                session.block_end = user.blocking_end_date;
                session.auth = true
                req.session.save()
                // generate token
                const jsonwebtoken = JWT.sign(
                    {
                        id: user._id,
                        name: user.name,
                        role: user.role,
                        status_default: user.status_default,
                        blocking_start_date: user.blocking_start_date,
                        blocking_end_date: user.blocking_end_date,
                        uuid: user.uuid,
                    },
                    JWT_KEY, { expiresIn: DEFAULT_TIME }
                );
                res.json({
                    status: true,
                    token: jsonwebtoken,
                    user: user
                })
            }
        }
    }
})
exports.decodeToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decodeToken = JSON.parse(jsonPayload);
    res.json(decodeToken)
})
exports.updateFile = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(User, req, res, next)
        result.update_file(
            "image", // model property name
            "user" // upload folder name
        )
    }
})
exports.updateMe = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(User, req, res, next)
        result.update_content()
    }
})
exports.deleteData = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(User, req, res, next)
        result.delete_data_with_file(
            "image", // model property name
            "user" // upload folder name
        )
    }
})
exports.get_by_role = asyncHandler(async (req, res, next) => {
    const result = new MyClass(User, req, res, next)
    result.get_by_role("region", "district", "school", "group", "category", "speciality")
})
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(User, req, res, next)
    result.get_one("region", "district", "school", "group", "category", "speciality")
});
exports.logout = asyncHandler(async (req, res, next) => {
    req.session.destroy()
    res.clearCookie("connect.sid")
    res.json({
        message: "Session is deleted"
    })
})
// Yagona  o'quv markaziga tegishli foydalanubchilarni olish
exports.filter_user = asyncHandler(async (req, res, next) => {
    pipeline = [
        {
            $match: {
                $and: [
                    {
                        school: {
                            $in: [ObjectId(req.query.school)]
                        }
                    },
                    {
                        role: {
                            $in: [req.query.role]
                        }
                    },
                    {
                        actions: {
                            $eq: req.query.actions
                        }
                    }
                ]
            }
        },
    ]
    await User.aggregate(pipeline).exec((error, data) => {
        if (error) {
            res.json({
                success: false,
                error: error
            })
        } else {
            res.json({
                success: true,
                data: data
            })
        }
    })
})
// O'quv markaz va guruh bo'yicha izlash
exports.filter_user_school_and_group = asyncHandler(async (req, res, next) => {
    pipeline = [
        {
            $match: {
                $and: [
                    {
                        school: {
                            $in: [ObjectId(req.query.school)]
                        }
                    },
                    {
                        group: {
                            $in: [ObjectId(req.query.group)]
                        }
                    },
                    {
                        role: {
                            $in: [req.query.role]
                        }
                    },
                    {
                        actions: {
                            $eq: req.query.actions
                        }
                    }
                ]
            }
        },
    ]
    await User.aggregate(pipeline).exec((error, data) => {
        if (error) {
            res.json({
                success: false,
                error: error
            })
        } else {
            res.json({
                success: true,
                data: data
            })
        }
    })
})
// Yagona  guruhga tegishli foydalanubchilarni olish
exports.filter_by_group = asyncHandler(async (req, res, next) => {
    pipeline = [
        {
            $match: {
                $and: [
                    {
                        group: {
                            $in: [ObjectId(req.query.group)]
                        }
                    },
                    {
                        role: {
                            $in: [req.query.role]
                        }
                    },
                    {
                        actions: {
                            $eq: req.query.actions
                        }
                    }
                ]
            }
        },
    ]
    await User.aggregate(pipeline).exec((error, data) => {
        if (error) {
            res.json({
                success: false,
                error: error
            })
        } else {
            res.json({
                success: true,
                data: data
            })
        }
    })
})
exports.changeOwnLogoBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(User, req, res, next)
        result.update_file(
            "managerLogoBrand", // model property name
            "user" // upload folder name
        )
    }
})





