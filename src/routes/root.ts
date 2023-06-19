import { Router } from 'express'
import { app } from '..'
import cookie from '../lib/cookie'
import util from '../lib/util'
const router = Router()

router.get('/', async (req, res) => {
  const response = await fetch(
    `${app.locals.HOST}/api/terms`,
    app.locals.defaultFetchArgs()
  )
  const jsonResponse = await util.checkResponse(response)
  // extract term strings from the jsonResponse (e.g. 'Fall 2023')
  const terms: Array<string> = jsonResponse.map(
    (term: { id: string }) => term.id
  )
  // const terms = ['Summer 2023', 'Fall 2023']
  res.render('pages/root/index.ejs', {
    terms,
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
    // if the cookie is valid, schedule refreshes and redirect to /
    console.log(
      'successful login, proxy is now available and cookie will now be refreshed'
    )
    cookie.scheduleRefresh()
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
