const mongoose = require('mongoose')
const task_child = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", index: true, required: true },
    task: { type: mongoose.Schema.ObjectId, ref: "task_main", required: true, index: true },
    members: { type: mongoose.Schema.ObjectId, ref: "user", required: true, index: true },
    username: {  type: String, required: true  },
    startDate: { type: String, required: true }, // vazifa boshlanish muddati
    endDate: { type: String, required: true }, // vazifa yakunlanish muddati
    
    // Agar foydalanuvchi vazifa uchun fayl yuklasa
    documents: [{ type: String }], 
    // Agar foydalanuvchi vazifa haqida fikr mulohazasini qoldirsa
    comment: [{ type: String }],
    /*
        1 -  vazifa topshirildi
        2 -  vazidani xodim qabul qildi
        3 -  vazifa to'liq bajarildi
        4 -  xodim vazifani bajara olmagan
    */
    status: { type: String, enum: ["1", "2", "3", "4"], default: "1" },
    
}, {
    timestamps: true
})

const TaskChild = mongoose.model('task_child', task_child)
module.exports = TaskChild