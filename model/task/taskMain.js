const mongoose = require('mongoose')
const task_main = mongoose.Schema({
    task: { type: String, required: true },
    school: { type: mongoose.Schema.ObjectId, ref: "school", index: true, required: true },
    members: [{ type: mongoose.Schema.ObjectId, ref: "user", required: true, index: true }],
    percentage: { type: Number, default: 0 },
    startDate: { type: String, required: true }, // vazifa boshlanish muddati
    endDate: { type: String, required: true }, // vazifa yakunlanish muddati
    actions: {
        type: String,
        enum: [
            "active",
            "archive",
        ],
        default: "active"
    },
    status: { type: String, required: true, enum: ["admin", "seller", "mentor"] }, // kimlar uchunligi kiritilishi kerak
    checking: { type: String, required: true, enum: ["0", "1",], default: "0", }, // vazifa to'liq qilingan yoki yoqligini bilish uchun; "1" - to'liq qilingan, "0" - vazifaq to'liq qilinmagan
}, {
    timestamps: true
})

const TaskMain = mongoose.model('task_main', task_main)
module.exports = TaskMain