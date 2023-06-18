import express from 'express'
import 'dotenv/config.js'

// Initialize express
const app = express()
const port = process.env.PORT || 42042

import { router as api } from './routes/api.js'

app.use('/api', api)

if (!process.env.cookie) throw Error('No cookie provided')

app.locals.cookie = process.env.cookie
app.locals.HOST = process.env.HOST || 'https://unl.collegescheduler.com'
app.locals.USERAGENT =
  process.env.USERAGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'

app.listen(port, () => {
  console.log(`proxy server listening on http://127.0.0.1:${port}`)
})
