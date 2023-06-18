import express from 'express'
const router = express.Router()

import fetch from 'node-fetch'

router.get('/*', async (req, res) => {
  // Check if cookie has not been initialized and tell user auth required
  if (!req.app.locals.cookie) {
    res.sendStatus(511)
    return
  }
  try {
    const response = await fetch(`${req.app.locals.HOST}${req.originalUrl}`, {
      method: req.method,
      redirect: 'manual',
      body: req.body,
      headers: new Headers({
        cookie: `.AspNet.Cookies=${req.app.locals.cookie}`,
        'User-Agent': req.app.locals.USERAGENT,
      }),
    })
    if (!response.ok) {
      throw new Error('Bad response from server')
    }
    res.send(await response.json())
  } catch (err) {
    console.error(err)
    res.sendStatus(502)
  }
})

export { router }
