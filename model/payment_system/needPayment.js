//  @Description: O'quvchilar har oy guruhiga qaysidir sanada to'lov qiladigan kunini belgilash;
const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    userID: { type: mongoose.Schema.ObjectId, ref: "user", required: true, index: true },
    groupID: { type: mongoose.Schema.ObjectId, ref: "group", index: true },
    startDay: { type: String, required: true },
    needPay: { type: String, required: true },
    all_month: [{ type: String, enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], required: true }], // nechi oy uchun o'qimoqchi
    payment: [
        {
            startMonth: { type: String, required: true },// qaysi sanadan 
            endMonth: { type: String, required: true }, // qaysi sanagacha
            types: { type: String, enum: ["debtor", "payed"], required: true }, // qarzdorlik holati
        }
    ] 
}, {
    timestamps: true
})
module.exports = mongoose.model('needPayment', DefaultSchema)