import { createClient } from 'redis'

const redis = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 10828,
  },
})

redis.on('error', (err: unknown) => console.log('Redis Client Error', err))
export default redis
