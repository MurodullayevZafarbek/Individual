const mongoose = require('mongoose')
/*
    Quyidagi holatlar uchun elementlar biriktiriladi: 

    "school" ga "category" ni biriktitish
    "speciality" ga "levelni" ni biriktrish
*/
const DefaultSchema = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", index: true },
    category: { type: mongoose.Schema.ObjectId, ref: "category", index: true },
    speciality: { type: mongoose.Schema.ObjectId, ref: "speciality", index: true },
    actions: {
        type: String,
        enum: [
            "active",
            "archive",
        ],
        default: "active"
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('union', DefaultSchema)