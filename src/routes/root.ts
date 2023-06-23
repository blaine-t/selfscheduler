// Import router so it can export routes back to index
import { Router } from 'express'
const router = Router()

import { app } from '..'
import cookie from '../lib/cookie'
import auth from '../lib/auth'
import autoenroll from '../lib/autoenroll'

// INDEX
router.get('/', async (req, res) => {
  res.render('pages/root/index.ejs', {
    terms: app.locals.terms,
  })
})

// LOGIN
router.get('/login', async (req, res) => {
  res.render('pages/root/login.ejs')
})

router.post('/login', async (req, res) => {
  const reqCookie = req.body.cookie
  if (!reqCookie) return

  app.locals.cookie = reqCookie
  let valid = true
  try {
    cookie.extract(await cookie.checkCookie())
  } catch (e) {
    valid = false
  }

  if (valid) {
    await auth.login()
    res.redirect('/')
  } else {
    // otherwise, login failed, unset cookie
    console.warn('failed login due to invalid cookie')
    app.locals.cookie = null
    res.redirect('/login?failed=true')
  }
})

// COOKIE
router.get('/cookie', async (req, res) => {
  res.send(app.locals.cookie)
})

// AUTOENROLL
router.get('/autoenroll', async (req, res) => {
  res.render('pages/root/autoenroll.ejs', {
    terms: app.locals.terms,
    enrollInterval: app.locals.enrollInterval,
    scheduledEnrollments: app.locals.scheduledEnrollments,
  })
})

// handles requests to setup automatic scheduled enrollment attempts
router.post('/autoenroll', autoenroll.postRequest)

// NOTIFICATION
router.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.write('data: Welcome to the SSE server!\n\n')
  app.locals.clients.push(res)

  req.on('close', () => {
    const index = app.locals.clients.indexOf(res)
    if (index > -1) {
      app.locals.clients.splice(index, 1)
    }
  })
})

export { router }
