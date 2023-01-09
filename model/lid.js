const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    region: { type: mongoose.Schema.ObjectId, ref: "region", required: true, index: true },
    district: { type: mongoose.Schema.ObjectId, ref: "district", required: true, index: true },
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true, index: true },
    category: { type: mongoose.Schema.ObjectId, ref: "category", required: true, index: true },
    speciality: { type: mongoose.Schema.ObjectId, ref: "speciality", required: true, index: true },
    week: [{ type: String, enum: ["1", "2", "3", "4", "5", "6", "7"], required: true }],
    free_start_time: { type: String, enum: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"], required: true },
    free_end_time: { type: String, enum: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"], required: true },
    username: { type: String, required: true },
    gender: { type: String, enum: ["man", "woman"] },
    actions: { type: String, enum: ["active", "archive"], default: "active" },
    status: {
        type: String,
        enum: [
            "1", // yangi
            "2", // suhbatdan o'tilgan
            "3", // sinov darslari
            "4", // accepted
            "5", // dars yoqmagan
        ],
        required: true,
    },
    howKnown: [
        {
            type: String,
            enum: [
                "1", // banner
                "2", // flayer
                "3", // telegram  
                "4", // instagram 
                "5", // facebook 
                "6", // youtube 
                "7", // tavsiya qilingan 
                "8", // o'zim topib keldim
                "9", // yoshlar daftari
                "10", // IT HOUSE
                "11", // led ekran
            ],
            required: true,
        }
    ],
    lid_type: {
        type: String,
        enum: [
            "1",    // Ochiq dars uchun lid qo'shish
            "2"     // Oddiy lid qo'shish
        ]
    },
    phone: { type: String, required: true },
    another_phone: { type: String, required: true },
    birthday: { type: String, required: true },
    reason: { type: String },  //  ochiq dars yoki dars yoqmagan tqdirda sababni kiritish kerak
    open_couse: { type: mongoose.Schema.ObjectId, ref: "rolik" }, // tashqaridan emas, o'quv markazni ichidan turib ochiq darsga qo'shib
    lessonType: { type: String, enum: ["online", "offline"], required: true } // dars offline yoki online holatdaligini aniqlash
}, {
    timestamps: true
})
module.exports = mongoose.model('lid', DefaultSchema)