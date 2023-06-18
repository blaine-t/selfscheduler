import express from 'express'
const app = express()
const port = 42042

import { router as api } from './routes/api'

app.use('/api', api)

app.listen(port, () => {
  console.log(`proxy server listening on http://127.0.0.1:${port}`)
})