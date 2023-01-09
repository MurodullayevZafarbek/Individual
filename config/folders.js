const fs = require('fs')
const path = require('path');
module.exports = () => {
    fs.mkdir(path.join(__dirname, "../public/user"), (error, callback) => {
        if (error) console.log("USER folder has already existed")
        else console.log("USER folder is created")
    })
    fs.mkdir(path.join(__dirname, "../public/excel"), (error, callback) => {
        if (error) console.log("EXCEL folder has already existed")
        else console.log("EXCEL folder is created")
    })
    fs.mkdir(path.join(__dirname, "../public/school"), (error, callback) => {
        if (error) console.log("SCHOOL folder has already existed")
        else console.log("SCHOOL folder is created")
    })
    fs.mkdir(path.join(__dirname, "../public/documents"), (error, callback) => {
        if (error) console.log("DOCUMENTS folder has already existed")
        else console.log("DOCUMENTS folder is created")
    })
}

