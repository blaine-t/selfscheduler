import { Router } from 'express'
import cookie from '../lib/cookie.js'
const router = Router()

function listEndpoints() {
  return `
<a href="terms">terms</a>
<br>
<a href="terms/:term/courses">terms/:term/courses</a>
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
    // Craft and send response to endpoint
    const url = `${req.app.locals.HOST}${req.originalUrl}`
    const headers = new Headers({
      cookie: `.AspNet.Cookies=${req.app.locals.cookie}`,
      'User-Agent': req.app.locals.USERAGENT,
    })
    const fetchArgs: RequestInit = {
      method: req.method,
      redirect: 'manual',
      body: req.body,
      headers: headers,
    }
    const response = await fetch(url, fetchArgs)

    if (response.status === 302) {
      throw Error('Provided cookie was invalid, unable to refresh')
    }

    // Attempt to parse json before sending to avoid double send
    const jsonResponse = await response.json()
    // Send response to client
    res.send(jsonResponse)
    // Attempt to extract the set-cookie if there is one from the response
    cookie.extract(response)
  } catch (err) {
    console.error(err)
    res.sendStatus(502)
  }
})

export { router }
