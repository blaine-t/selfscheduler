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
  })
})

// handles requests to setup automatic scheduled enrollment attempts
router.post('/autoenroll', async (req, res) => {
  const term = req.body.term
  const interval = parseInt(req.body.interval)
  if (!(term && interval >= 0)) {
    res.redirect('/autoenroll?error=Invalid request')
    return
  }

  // ensure the interval isn't too short
  if (interval < 15000) {
    res.redirect('/autoenroll?error=Interval must be greater than 15000 ms')
  }

  // the post request expects the term string e.g. "Fall 2023"
  // we need to convert it to the term code e.g. 1238
  const termIndex = app.locals.terms.indexOf(term)
  if (termIndex === -1) {
    // this shouldn't be possible when term is a dropdown, but we'll handle it anyway
    res.redirect('/autoenroll?error=Invalid term')
    return
  }
  const termCode = app.locals.termCodes[termIndex]

  autoenroll.enrollInterval(termCode, interval)
  res.redirect('/autoenroll?msg=Interval set successfully')
})

export { router }
