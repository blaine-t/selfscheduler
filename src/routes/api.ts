// Import router so it can export routes back to index
import { Router } from 'express'
const router = Router()

import util from '../lib/util'

function listEndpoints() {
  return `
<a href="/api/terms">terms</a> <br>
<a href="/api/terms/Fall 2023/courses">terms/:term/courses</a> <br>
<a href="/api/term-data/Fall 2023">term-data/:term</a> <br>
<a href="/api/app-data">app-data</a> <br>
<a href="/api/oauth/student/client-credentials/token">oauth/student/client-credentials/token</a> <br>
`
}

router.get('/', (req, res) => {
  // Send list of all the available api end points
  res.send(listEndpoints())
})

router.get('/*', async (req, res) => {
  // Check if cookie has not been initialized and tell user auth required
  if (!req.app.locals.cookie) {
    res.sendStatus(511)
    return
  }
  try {
    // Request the real endpoint and get the JSON response
    const jsonResponse = await util.requestJson(req.originalUrl)
    // Send server response back to client
    res.send(jsonResponse)
  } catch (err) {
    console.error(err)
    res.sendStatus(502)
  }
})

export { router }
