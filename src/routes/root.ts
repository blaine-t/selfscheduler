// Import router so it can export routes back to index
import { Router } from 'express'
const router = Router()

import { app } from '..'
import cookie from '../lib/cookie'
import auth from '../lib/auth'
import autoenroll from '../lib/autoenroll'
import rmp from '../lib/rmp'

// INDEX
router.get('/', async (req, res) => {
  res.render('pages/root/index.ejs')
})

// LOGIN
router.get('/login', async (req, res) => {
  //TODO: Add images for light vs dark mode
  res.render('pages/root/login.ejs', { userAgent: req.get('User-Agent') })
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

// RMP
router.get('/rmp', async (req, res) => {
  // Grab school ID if it hasn't been already
  if (!app.locals.rmpSchoolID) {
    await rmp.schoolID()
  }
  // Make sure the request has a professors name
  if (!req.query.name) {
    console.warn('No professor name provided')
    res.sendStatus(204) // No content
    return
  }
  // Send the results of the RMP call to find data on the professor
  const rmpResponse = await rmp.getProfessorStats(String(req.query.name))
  if (rmpResponse == null) {
    res.sendStatus(502)
  } else {
    res.send(rmpResponse)
  }
})

// COURSES
router.get('/courses', async (req, res) => {
  res.render('pages/root/courses.ejs', {
    terms: app.locals.terms,
    subjects: app.locals.termSubjects,
  })
})

export { router }
