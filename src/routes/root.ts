import { Router } from 'express'
import { app } from '..'
import cookie from '../lib/cookie'
import auth from '../lib/auth'
const router = Router()

router.get('/', async (req, res) => {
  res.render('pages/root/index.ejs', {
    terms: app.locals.terms,
  })
})

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

// just respond with the current cookie at /cookie
router.get('/cookie', async (req, res) => {
  res.send(app.locals.cookie)
})

export { router }
