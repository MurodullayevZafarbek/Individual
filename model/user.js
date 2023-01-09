const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const User = mongoose.Schema({
    region: { type: mongoose.Schema.ObjectId, ref: "region", index: true },
    district: { type: mongoose.Schema.ObjectId, ref: "district", index: true },
    school: [{ type: mongoose.Schema.ObjectId, ref: "school", index: true }], // mentor/sotuvchi/o'quvchi qaysi o'quv markazlar uchun biriktirllgani haqida
    group: [{ type: mongoose.Schema.ObjectId, ref: "group", index: true }], // mentor/student uchun guruhga biriktrish
    category: [{ type: mongoose.Schema.ObjectId, ref: "category", index: true }], // manager/mentor/o'quvchi uchun kategoriyalar biriktirish
    speciality: [{ type: mongoose.Schema.ObjectId, ref: "speciality", index: true }],// manager/mentor/o'quvchi uchun kurs biriktirish
    student_discount: { type: mongoose.Schema.ObjectId, ref: "discount", index: true },// o'quvchi uchun chegirma qilib berish
    name: { type: String, required: true }, // Foydalanuvchining ismi
    password: { type: String, required: true, },
    phone: { type: String, required: true, },
    image: [{ type: String }],
    passport: { type: String, unique: true },
    role: { type: String, enum: ["super_admin", "manager", "admin", "mentor", "seller", "student", "user",], required: true, index: true },
    // Foydalanuvchini istalgan paytda bloklash uchun 
    status_default: { type: String, required: true, enum: ["none", "forever", "pending"], index: true },
    blocking_start_date: { type: String, },
    blocking_end_date: { type: String, },
    actions: { type: String, enum: ["active", "archive",], default: "active" }, // aktiv yoki arxiv(o'chirish) bolimiga qo'shish
    balance: { type: Number, default: 0 }, // foydalanuvchining balansini toldirish
    uuid: { type: String }, // maxsus UUID kod
    enteredTime: { type: String }, // kirgan va chiqqan paytlari yoziladi
    leavedTime: { type: String, }, // kirgan va chiqqan paytlari yoziladi
    gender: { type: String, enum: ["man", "woman",] },
    managerLogoBrand: { // o'quv markaz egasining shaxshiy bran logotipini berish
        type: String
    },
    // Hodimlar uchun oylik maoshni foizda belgilash
    salary: {
        status: {
            type: String,
            enum: [
                "1", // oylik maosh uchun shartnoma belgilangan;
                "0", // oylik maosh uchun shartnoma belgilanmagan
            ],
        },
        percenteage: {
            staff_side: { type: String }, // xodim tarag uchun foiz miqdori belgilanadi
            school_side: { type: String }, // ishxona tomon uchun foiz miqdori belgilanadi
        },
        per_person: { type: String }, // kishi boshiga hisoblagandagi oylik
        default_salary: { type: String } // qanday holatda bo'lishidan qatiy nazar umumiy 1 oy uchun oylik belgilash
    },
    // Foydalanuvchi haqida qo'shimcha ma'lumot kiritish
    additionalDocuments: {
        nickname: { type: String }, // bir xil ismli foydalanuvchilarni adashtrib qoymaslik uchun NIKNAME berish
        another_phone: { type: String }, // foydalanuvchining qo'shimcha telefon raqami
        surname: { type: String }, // foydalanuvchining familiyasi
        father_name: { type: String }, // otasining ismi
        telegram_username: { type: String }, // telegram manzili
        born_date: { type: String }, // tugilgan sana
        address: { type: String }, // foydalanuvchining yashah manzili
        graduation: [
            {
                name: { type: String }, // qaysi Universitet yoki Talim dargohida o'qiganligi haqida ma'lumot
                level: { // toifa darajasi
                    type: String,
                    enum: [
                        "1", // o'rta
                        "2", // bakalavr
                        "3", // magistr
                    ]
                },
                // document: { type: String } // Tahsil olib bitirgan joyning Diplomi yoki sertifikatining fayl korinishidagi nusxasi
            }
        ],
    },
}, {
    timestamps: true
})
User.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
module.exports = mongoose.model('user', User)


/*
    1. Super_Admin yaratilganda  o'quv markazning ID si SCHOOL modeldagi manager proprtysi biriktiriladi,  USER modeldagi school propertysiga emas
    2. Quyidagilar uchun boshqacha: 
        Manager yaratilganda  o'quv markazning ID si SCHOOL modeldagi manager proprtysiga emas balki USER modeldagi school propertysiga qoshiladi
        Admin   yaratilganda  o'quv markazning ID si SCHOOL modeldagi manager proprtysiga emas balki USER modeldagi school propertysiga qoshiladi
        Mentor  yaratilganda  o'quv markazning ID si SCHOOL modeldagi manager proprtysiga emas balki USER modeldagi school propertysiga qoshiladi
        Seller  yaratilganda  o'quv markazning ID si SCHOOL modeldagi manager proprtysiga emas balki USER modeldagi school propertysiga qoshiladi
        Student yaratilganda  o'quv markazning ID si SCHOOL modeldagi manager proprtysiga emas balki USER modeldagi school propertysiga qoshiladi

*/