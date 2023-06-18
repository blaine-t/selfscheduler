import express from 'express'

const app = express()
const port = 42042

import { router as api } from './routes/api.js'

app.use('/api', api)

app.locals.HOST = 'https://unl.collegescheduler.com'
app.locals.cookie = 'myCookie'

app.listen(port, () => {
  console.log(`proxy server listening on http://127.0.0.1:${port}`)
})
