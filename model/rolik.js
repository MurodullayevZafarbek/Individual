const mongoose = require('mongoose')
// Ochiq dars uchun kontent tayyorlash
const DefaultSchema = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true, index: true },
    category: { type: mongoose.Schema.ObjectId, ref: "category", required: true, index: true },
    speciality: { type: mongoose.Schema.ObjectId, ref: "speciality", required: true, index: true },
    mentor: { type: String, required: true },
    rolik: { type: String, required: true }, // youtubedan rolikning url manzili beriladi
    title: { type: String, required: true },
    about: [{ type: String,  }], // Kurs haqida malumotlar
    requirement: [{ type: String,}],// Kurs uchun talablar
    forWhom: [{ type: String,  }],// Kurs kimlar uchun
    actions: { type: String, enum: ["active", "archive",], default: "active" },
    startDate: { type: String, required: true }, // kurs boshlanadigan sanasi
    endDate: { type: String, required: true }, // kurs yakunlanadigan sanasi 
    lessonType: { type: String, enum: ["online", "offline"], required: true },
    link: { type: String, required: true },
    address: { type: String, required: true },
}, {
    timestamps: true
})

module.exports = mongoose.model('rolik', DefaultSchema)