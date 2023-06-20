import { Router } from 'express'
import { app } from '..'
import cookie from '../lib/cookie'
import auth from '../lib/auth'
import autoenroll from '../lib/autoenroll'
const router = Router()

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
    console.log('failed login due to invalid cookie')
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
  })
})

// handles requests to setup automatic scheduled enrollment attempts
router.post('/autoenroll', async (req, res) => {
  switch (req.body.action) {
    case 'clearInterval': {
      console.log(`${app.locals.stamp()} Clearing current enrollment interval`)
      clearInterval(app.locals.enrollInterval)
      app.locals.enrollInterval = null
      res.redirect('/autoenroll')
      break
    }
    case 'setInterval': {
      const term = req.body.term
      const interval = parseInt(req.body.interval) * 1000 // convert from seconds to ms
      if (!term || isNaN(interval)) {
        res.redirect('/autoenroll?error=Invalid request')
        break
      }
      // ensure the interval isn't too short
      if (interval < 15000) {
        res.redirect(
          '/autoenroll?error=Interval must be greater than 15 seconds'
        )
        break
      }
      // the post request expects the term string e.g. "Fall 2023"
      // we need to convert it to the term code e.g. 1238
      const termIndex = app.locals.terms.indexOf(term)
      if (termIndex === -1) {
        // this shouldn't be possible when term is a dropdown, but we'll handle it anyway
        res.redirect('/autoenroll?error=Invalid term')
        break
      }
      const termCode = app.locals.termCodes[termIndex]

      autoenroll.setEnrollInterval(termCode, interval)
      res.redirect('/autoenroll')
      break
    }
  }
})

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
