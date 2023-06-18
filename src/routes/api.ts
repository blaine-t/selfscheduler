import express from 'express'
const router = express.Router()

import fetch from 'node-fetch'

router.get('/*', async (req, res) => {
  // Check if cookie has not been initialized and tell user auth required
  if (!req.app.locals.cookie) {
    res.sendStatus(511)
    return
  }
  const fetchArgs = {
    method: req.method,
    body: req.body,
    headers: {
      cookie: req.app.locals.cookie,
    },
  }
  try {
    const response = await fetch(
      `${req.app.locals.HOST}/${req.originalUrl}`,
      fetchArgs
    )
    if (!response.ok) {
      throw new Error('Bad response from server')
    }
    res.send(await response)
  } catch (err) {
    console.error(err)
    res.sendStatus(502)
  }
})

export { router }
