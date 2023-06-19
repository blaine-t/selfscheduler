import express from 'express'
import { app } from '../index'
import { checkCookie, scheduleRefresh } from '../lib/cookie'
const router = express.Router()

router.get('/', async (req, res) => {
  if (app.locals.cookie) {
    res.render('pages/root/index.ejs')
  } else {
    res.redirect('/login')
  }
})

router.all('/login', async (req, res) => {
  // if you're already "logged in" just redirect to /
  if (app.locals.cookie) {
    res.redirect('/')
    return
  }

  if (req.method == 'GET') {
    res.render('pages/root/login.ejs')
  } else if (req.method == 'POST') {
    const cookie = req.body.cookie
    app.locals.cookie = cookie
    let valid = true
    try {
      await checkCookie()
    } catch (e) {
      valid = false
    }
    
    if (valid) {
      // if the cookie is valid, schedule refreshes and redirect to /
      console.log('successful login, proxy is now available and cookie will now be refreshed')
      scheduleRefresh()
      res.redirect('/')
    } else {
      // otherwise, login failed, unset it
      console.log('failed login due to invalid cookie')
      app.locals.cookie = undefined
      res.redirect('/login?failed=true')
    }
  }
})

export { router }
