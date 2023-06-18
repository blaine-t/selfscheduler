// Initialize express
import express from 'express'
const app = express()
const port = process.env.PORT || 42042

// Add proxy api endpoint
import { router as api } from './routes/api.js'
app.use('/api', api)

// Source .env
import 'dotenv/config.js'

// Check cookie
if (!process.env.COOKIE) throw Error('No cookie provided')

// Load env variables to app.locals
app.locals.cookie = process.env.COOKIE
app.locals.HOST = process.env.HOST || 'https://unl.collegescheduler.com'
app.locals.USERAGENT =
  process.env.USERAGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'

// Timestamp to use anywhere
app.locals.stamp = () => `${new Date().toLocaleTimeString('en-UK')}`

// Import cookie lib to setup keepalive
import cookie from './lib/cookie.js'

// Setup the cookie refresher to run every 10 minutes with node-schedule
cookie.scheduleRefresh()

// Host express server
app.listen(port, () => {
  console.info(`proxy server listening on http://127.0.0.1:${port}`)
})

// Export app so locals are available to other ts files
export { app }
