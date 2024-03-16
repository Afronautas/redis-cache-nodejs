import { createClient } from "redis"

export const redisClient = createClient({
    password: "",
    socket: {
        host: "localhost",
        port: 6379
    }
})