const CALLBACK = {
    error_create_data: () => {
        return new Object({
            message: "Malumot yaratishda hatolik mavjud",
            data: false
        })
    },
    success_create_data: () => {
        return "Malumot muvaffaqiyatli yaratildi"
    },
    success_get_data: (item) => {
        return new Object({
            message: "Malumot muvaffaqiyatli olindi",
            count: item.length,
            data: item
        })
    },
    success_get_single_data: (item) => {
        return new Object({
            message: "Malumot muvaffaqiyatli olindi",
            data: item
        })
    },
    error_get_data: () => {
        return new Object({
            message: "Malumot olish muvaffaqiyatsizlikka uchradi",
            data: false
        })
    },
    success_update_data: (item) => {
        return new Object({
            message: "Malumot muvaffaqiyatli tahrirlandi",
            data: item
        })
    },
    error_update_data: (item) => {
        return new Object({
            message: "Malumot tahrirlashda muvaffaqiyatsizlikka uchradi",
            data: item
        })
    },
    success_delete_data: () => {
        return new Object({
            message: "Malumot muvaffaqiyatli o'chirildi",
            data: []
        })
    },
    success_get_all: (item) => {
        return new Object({
            message: "Hamma malumotlar muvaffaqiyatli olindi",
            count: item.length,
            data: item
        })
    },
    error_get_all: (item) => {
        return new Object({
            message: "Hamma malumotlar olishda muvaffaqiyatsizlikka uchradi",
            data: item
        })
    },
    errorToken: (item) => {
        return new Object({
            message: "Siz avtorizatsiyadan o'tmagansiz",
            data: item
        })
    },
    errorSession: (item) => {
        return new Object({
            message: "Siz avtorizatsiyadan o'tmagansiz",
            data: item
        })
    },
    checkStatus: (item) => {
        return new Object({
            message: "Siz vaqtinchalik bloklangansiz",
            data: item
        })
    },
    checkRole: () => {
        return new Object({
            message: "Siz ushbu malumotni olish uchun huquq mavjud emas",
        })
    },

}
module.exports = CALLBACK