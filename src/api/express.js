import express from 'express'
import { db } from '../repository/nedb.repository.js'
import { redisClient } from '../redis/redis.js'

export const app = express()
app.use(express.json())

// routes
app.get('/v1/posts', async (_, res) => {
    try {
        const posts = await db.findAsync()

        return res.status(200).json({ data: posts })
        
    } catch (error) {
        return res.status(500).json({ message: "UNEXPECTED ERROR" })
    }
})

app.get('/v1/posts/:query', async (req, res) => {
    try {

        const query = `${req.params.query}`

        let post = null 

        const redisKey = query.replaceAll(" ", "_").toLowerCase()
        const redisPost = await redisClient.get(redisKey)

        if (!redisPost) {
            post = await db.findOneAsync({ title: query })
            if (!!post) {
                const redisContent = JSON.stringify(post)
                await redisClient.set(redisKey, redisContent, { EX: 60 * 15 })
            }
        }else {
            post = JSON.parse(redisPost)
        }
    
        return res.status(200).json({ data: post })
        
    } catch (error) {
        return res.status(500).json({ message: "UNEXPECTED ERROR" })
    }
})

app.post('/v1/posts', async (req, res) => {
    try {
        // title & description
        const data = req.body
        const { title, description } = data
        const createdAt = new Date()

        const createdDocument = await db.insertAsync({ title, description, createdAt })

        const redisKey = `${title}`.replaceAll(" ", "_").toLowerCase()
        const redisContent = JSON.stringify({_id: createdDocument._id, title, description, createdAt})
        await redisClient.set(redisKey, redisContent, { EX: 60 * 15 })

        return res.status(201).json({ message: "CREATED"  })

    } catch (error) {
        return res.status(500).json({ message: "UNEXPECTED ERROR" })
    }
})