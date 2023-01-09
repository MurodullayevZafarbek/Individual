const redis = require('redis');
const {redis_port} = require('../config/default')
const client = async () => {
    const client = redis.createClient(`redis://localhost:${redis_port}`);
    await client.connect()
        .then(() => {
            console.log("Redis is connected on", redis_port)
        })
        .catch((error) => {
            console.log("Redis is not connecting")
        })
    return client;
}

module.exports = client()