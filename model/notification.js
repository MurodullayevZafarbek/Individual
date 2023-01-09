const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    message: { type: String, required: true },
    userID: { type: mongoose.Schema.ObjectId, ref: "user", required: true, },
    status: {
        type: String,
        enum: ["0", "1"],
        default: "0"
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('notification', DefaultSchema)