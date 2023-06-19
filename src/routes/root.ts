import { Router } from 'express'
import { app } from '..'
import { checkCookie, scheduleRefresh } from '../lib/cookie'
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
  res.render('pages/root/index.ejs', {
    terms,
  })
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
