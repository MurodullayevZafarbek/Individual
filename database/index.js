const mongoose = require('mongoose');
const {
    DATABASE_URL,
    DATABASE_OPTIONS
} = require('../config/default')

const connection = () => {
    mongoose
        .connect(DATABASE_URL, DATABASE_OPTIONS)
        .then(() => { console.log("Database is connected") })
        .catch((error) => { console.log(error.message) })
}
module.exports = connection