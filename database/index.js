const mongoose = require('mongoose');
const {
    DATABASE_URL,
} = require('../config/default')


const connection = () => {
    mongoose
        .connect(DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        })
        .then(() => { console.log("Database is connected") })
        .catch((error) => { console.log(error.reason) })

    


}
module.exports = connection