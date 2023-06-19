import { Router } from 'express'
import { app } from '..'
import { checkCookie, scheduleRefresh } from '../lib/cookie'
const router = Router()

router.get('/', async (req, res) => {
  res.render('pages/root/index.ejs')
})

router.get('/login', async (req, res) => {
  res.render('pages/root/login.ejs')
})

router.post('/login', async (req, res) => {
  const cookie = req.body.cookie
  if (!cookie) return

  app.locals.cookie = cookie
  let valid = true
  try {
    await checkCookie()
  } catch (e) {
    valid = false
  }

  if (valid) {
    // if the cookie is valid, schedule refreshes and redirect to /
    console.log(
      'successful login, proxy is now available and cookie will now be refreshed'
    )
    scheduleRefresh()
    res.redirect('/')
  } else {
    // otherwise, login failed, unset it
    console.log('failed login due to invalid cookie')
    app.locals.cookie = undefined
    res.redirect('/login?failed=true')
  }
})

export { router }
