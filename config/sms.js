const axios = require("axios");
const config = require('./default')

// Sms jo'natish tizimino o'rnatish
exports.smsSend = (phone, message, email, password) => {
    axios({
        method: "POST",
        url: "http://notify.eskiz.uz/api/auth/login",
        data: {
            email: email,
            password: password,
        },
    })
        .then((response) => {
            axios({
                method: "POST",
                url: "http://notify.eskiz.uz/api/message/sms/send",
                headers: { Authorization: `Bearer ${response.data.data.token}`, },
                data: {
                    mobile_phone: phone,
                    message: message,
                }
            })
                .then((responses) => {
                    console.log(responses.data)
                })
        })
};
// Tarifda qancha pul qolgani haqida ma'lumot chiqishi kerak 
exports.checkLimit = () => {
    return (req, res, next) => {
        axios({
            method: "POST",
            url: "http://notify.eskiz.uz/api/auth/login",
            data: {
                email: config.smsEmail,
                password: config.smsToken,
            },
        })
            .then((resp) => {
                axios({
                    method: "GET",
                    url: "http://notify.eskiz.uz/api/user/get-limit",
                    headers: { Authorization: `Bearer ${response.data.data.token}`, },
                })
                    .then((callback) => {
                        res.json({
                            message: "Success",
                            data: callback.data.data
                        })
                    })
            })
    };
}
// Jonatilgan smslar sonini ko'rish
exports.checkCount = (year) => {
    return (req, res, next) => {
        if (year == "") {
            res.json({
                success: false,
                message: "SMS uchun formani kiriting"
            })
        }
        else {
            axios({
                method: "POST",
                url: "http://notify.eskiz.uz/api/auth/login",
                data: {
                    email: config.smsEmail,
                    password: config.smsToken,
                },
            })
                .then((resp) => {
                    axios({
                        method: "POST",
                        url: "http://https://notify.eskiz.uz/api/user/totals",
                        headers: { Authorization: `Bearer ${response.data.data.token}`, },
                        data: {
                            year: year,
                            user_id: "5",
                        }
                    })
                        .then((callback) => {
                            res.json({
                                message: "Success",
                                data: callback.data.data
                            })
                        })
                })
        }
    };
}
