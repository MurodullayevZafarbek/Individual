// O'quvchi va xodimlar uchun umumiy davomad qilish
const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "school",
        required: true,
        index: true
    },
    group: {
        type: mongoose.Schema.ObjectId,
        ref: "group",
        index: true
    },
    members: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        index: true,
        required: true
    },
    // jamoa azozsi agar ochib ketadigan bolsa shu yerga ismi yoziladi
    name: {
        type: String, required: true,
    },
    day: {
        type: String, required: true,
        enum: [
            "1", "11", "21", "31",
            "2", "12", "22",
            "3", "13", "23",
            "4", "14", "24",
            "5", "15", "25",
            "6", "16", "26",
            "7", "17", "27",
            "8", "18", "28",
            "9", "19", "29",
            "10", "20", "30",
        ]
    },
    month: {
        type: String, required: true,
        enum: [
            "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
        ]
    },
    year: {
        type: String, required: true,
        enum: ["2022", "2023", "2024", "2025"]
    },
    absent: {
        type: String,
        required: true,
        enum: [
            "0",// kelmagan 
            "1", // kelgan
            "2", // Kech qolgan
            "3", // Erta kelgan
        ]
    },
    reason: [{
        type: String,
        enum: [
            "0", // Sababsiz ishga kelmaslik
            "1", // Xojayinning buyrug'i bilan boshqa joyga borganligi uchun kelmaslik
            "2", // Ishlash tartibidan norozi bo'lganlik uchun
            "3", // Yo'lda vaqtinchalik ushlanib qolish
            "4", // Kasallik tufayli kelmaganlik 
            "5", // Shaxsiy ish yuzasidan kelmadi
            "6", // Ob-havoning noqulayligi tufayli
            "t5", // 5 daqiqa
            "t10", // 10 daqiqa
            "t15", // 15 daqiqa
            "t20", // 20 daqiqa
            "t25", // 25 daqiqa
            "t30", // 30 daqiqa
            "t60", // 60 daqiqa
        ]
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('attendance', DefaultSchema)