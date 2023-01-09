const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    region: {
        type: mongoose.Schema.ObjectId,
        ref: "region",
        required: true,
        index: true
    },
    district: {
        type: mongoose.Schema.ObjectId,
        ref: "district",
        required: true,
        index: true
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
    },
    category: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "category",
            required: true,
        }
    ],
    name: {
        type: String, required: true,
    },
    subDomain: { type: String },
    code: {
        type: Number, required: true,
    },
    phone: {
        type: String, required: true,
    },
    school_descrtiption: [
        {
            type: String, required: true
        }
    ],
    image: [
        {
            type: String
        }
    ],
    actions: {
        type: String,
        enum: [
            "active",
            "archive",
        ],
        default: "active"
    },
    sms: {
        status: {
            type: String,
            enum: [
                "0", // SMS jo'natish faol emas
                "1", // SMS jo'natish faollashtirilgan
            ],
            default: "0"
        },
        sms_email: { type: String, default: "none" },
        sms_token: { type: String, default: "none" },
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('school', DefaultSchema)