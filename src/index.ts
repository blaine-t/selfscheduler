// Initialize express
import express from 'express'
const app = express()
const port = process.env.PORT || 42042

// Set the view engine to EJS, enable url encoded request bodies
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

// Initialize "authentication"
import { checkAuthentication } from './lib/util';
app.use(checkAuthentication)

// Add endpoints
import { router as api } from './routes/api'
import { router as root } from './routes/root'
import { router as requests } from './routes/requests'
app.use('/api', api)
app.use('/', root)
app.use('/requests', requests)

// Source .env
import 'dotenv/config'

// Load env variables to app.locals
app.locals.HOST = process.env.HOST || 'https://unl.collegescheduler.com'
app.locals.USERAGENT =
  process.env.USERAGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
app.locals.WS_HOST = process.env.WS_HOST || 'wss://api.collegescheduler.com'
app.locals.headers = () => {
  return new Headers({
    cookie: `.AspNet.Cookies=${app.locals.cookie}`,
    'User-Agent': app.locals.USERAGENT,
  })
}
app.locals.defaultFetchArgs = () => {
  return {
    method: 'GET',
    redirect: 'manual',
    headers: app.locals.headers(),
  }
}

// Timestamp to use anywhere
app.locals.stamp = () => `${new Date().toLocaleTimeString('en-UK')}`

// Host express server
app.listen(port, () => {
  console.info(`proxy server listening on http://127.0.0.1:${port}`)
})

// Export app so locals are available to other ts files
export { app }
