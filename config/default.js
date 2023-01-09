const secret = {
    port: 5000,
    redis_port: 6379,
    JWT_KEY: "784sdsdsdhyohsu7324gcx64c847324gcx64cw5evr74399998",
    SESSION_KEY: "784sdsdsdhyohsu7324gcxKJ3242I3DO8944C264H9240243",
    DEFAULT_TIME: 1000 * 60 * 60 * 24 * 6,
    // DATABASE_URL: "mongodb://localhost:27017/it_house",
    DATABASE_URL: "mongodb://127.0.0.1:27017/test",
    DATABASE_OPTIONS: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    },
    SESSION_COLLECTION_NAME: 'Default_session',
    smsEmail: "ithouseedu@gmail.com",
    smsToken: "5t9rfCXmPzYG0BjEYVx33kjOiiDm1hBo7tlH8LnV"
}
module.exports = secret;