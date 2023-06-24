// Import Response as ExpressResponse because of conflict with fetch Response type
import { Request, Response as ExpressResponse, NextFunction } from 'express'

import { app } from '..'
import util from './util'
import cookie from './cookie'

/**
 * Middleware for protected routes, redirects to /login if a cookie isn't set yet
 * @param req
 * @param res
 * @param next
 */
function checkAuthentication(
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) {
  if (app.locals.cookie && req.originalUrl.split('?')[0] === '/login') {
    res.redirect('/')
  } else if (app.locals.cookie || req.originalUrl.split('?')[0] === '/login') {
    next()
  } else {
    res.redirect('/login')
  }
}

/**
 * Handle logging in once a successful cookie is given by the user
 */
async function login() {
  // if the cookie is valid, schedule refreshes and redirect to /
  console.info(
    'successful login, proxy is now available and cookie will now be refreshed'
  )
  cookie.scheduleRefresh()
  // use the new cookie to cache info into the app so we don't have to request it later
  // Term info
  const jsonResponse = await util.requestJson('/api/terms')
  // extract term strings from the jsonResponse (e.g. 'Fall 2023')
  app.locals.terms = jsonResponse.map((term: { id: string }) => term.id)
  app.locals.termCodes = jsonResponse.map((term: { code: string }) => term.code)

  // Subject info
  for (const term of app.locals.terms) {
    const jsonResponse = await util.requestJson(`/api/terms/${term}/subjects`)
    app.locals.termSubjects.push(
      jsonResponse.map((subject: { id: string }) => subject.id)
    )
  }
}

export default { checkAuthentication, login }
