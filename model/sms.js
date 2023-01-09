const mongoose = require('mongoose')
const sms_category = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: [
            "1", // Maxsus bayramlar uchun
            "2", // Tug'ilgan kunlar uchun
        ],
        required: true
    },
    actions: {
        type: String,
        enum: ["active", "archive"],
        default: "active"
    },
}, {
    timestamps: true
})
const sent_sms = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true },
    userID: { type: mongoose.Schema.ObjectId, ref: "user", required: true }, // qabul qiluvchining idsi 
    username: { type: String, required: true }, // qabul qiluvchining ismi 
    phone: { type: String, required: true }, // qabul qiluvchining telefon raqami
    userrole: { type: String, enum: ["admin", "mentor", "seller", "student"], required: true }, // kimlar uchun sms habar jo'ntilgan
    message: { type: String, required: true },
    status: { type: String, enum: ["congratulation", "special"], required: true }, // sms habar turini aniqlash 
    actions: { type: String, enum: ["active", "archive"], default: "active" },
    senderID: { type: mongoose.Schema.ObjectId, ref: "user", required: true },
    sendername: { type: String, required: true },
}, {
    timestamps: true
})

const smsCategory = mongoose.model('sms', sms_category);
const sentSms = mongoose.model('sent_sms', sent_sms);
module.exports = {
    smsCategory,
    sentSms,
}