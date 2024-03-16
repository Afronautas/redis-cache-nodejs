import { redisClient } from "../redis/redis.js"
import { app } from "./express.js"

const PORT = 8081;

// Redis instance connection
(async () => {
    redisClient.on('error', err => console.log("Redis error: ", err))
    await redisClient.connect()
    console.log("Server connected to Redis")
})()

process.on('SIGINT', () => {
    (async () => {
        await redisClient.disconnect()
    })()
    process.exit()
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})