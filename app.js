
const express = require('express');
const app = express()
const connection = require('./database/index')
const bodyParser = require("body-parser")
const path = require('path')
const expressEjsLayouts = require('express-ejs-layouts')
const expressSession = require('express-session')
const mongoDbSession = require('connect-mongodb-session')(expressSession)
const { port, SESSION_KEY, DEFAULT_TIME, DATABASE_URL } = require('./config/default')
const smsCron = require("./config/smsCron")
const folder = require("./config/folders")

// MIDDLEWARES
const store = new mongoDbSession({
  uri: DATABASE_URL,
  collection: "SESSION"
})
app.use(
  expressSession({
    secret: SESSION_KEY,
    saveUninitialized: false,
    store: store,
    resave: false,
    cookie: {
      httpOnly: true,
      maxAge: DEFAULT_TIME,
      sameSite: "strict"
    }
  })
)

app.use(bodyParser.json())
app.use(expressEjsLayouts)
app.use(bodyParser.urlencoded({ extended: false }))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))
folder()
connection()
smsCron()




// FRONTEND - PAGE ROUTER
app.use("/", require('./views/router/auth')) // auth
app.use("/super_admin", require('./views/router/super_admin')) // super admin
app.use("/manager", require('./views/router/manager')) // manager
app.use("/admin", require('./views/router/admin')) // admin
app.use("/seller", require('./views/router/seller')) // seller
app.use("/mentor", require('./views/router/mentor')) // mentor


// BACKEND REST API
app.use('/api/user', require('./router/user'))
app.use('/api/school', require('./router/school'))
app.use('/api/category', require('./router/category'))
app.use('/api/speciality', require('./router/speciality'))
app.use('/api/level', require('./router/level'))
app.use('/api/group', require('./router/group'))
app.use('/api/region', require('./router/region'))
app.use('/api/district', require('./router/district'))
app.use('/api/lid', require('./router/lid'))
app.use('/api/union', require('./router/union'))
app.use('/api/attendance', require('./router/management/attendance'))
app.use('/api/room', require('./router/management/room'))
app.use('/api/rolik', require('./router/rolik'))
app.use('/api/income', require('./router/payment_system/income'))
app.use('/api/salary', require('./router/payment_system/salary'))
app.use('/api/task_main', require('./router/task/taskMain'))
app.use('/api/task_child', require('./router/task/taskChild'))
app.use('/api/sms', require('./router/sms'))
app.use('/api/analitic', require('./router/analitic'))
app.use('/api/discount', require('./router/discount'))
app.use('/api/need_payment', require('./router/payment_system/needPayment'))
app.use('/api/search', require('./router/search'))
app.use('/api/notification', require('./router/notification'))
app.use('/api/form', require('./router/form/form'))
app.use('/api/form_element', require('./router/form/form_element'))




app.use('/api/test', require('./router/testModel'))
app.get("*", async (req, res) => {
  res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
})




// CREATE FOLDERS


// SERVER RUNNING
const server = app.listen(port, () => {
  console.log("Server is connected", server.address().port)
})