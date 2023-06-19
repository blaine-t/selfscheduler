import { Request, Response as ExpressResponse, NextFunction } from 'express'
import { app } from '..'

async function checkResponse(response: Response) {
  if (response.status !== 200) {
    throw Error(
      `Provided cookie was invalid with status code ${response.status}`
    )
  }
  try {
    const jsonResponse = await response.json()
    return jsonResponse
  } catch (err) {
    return err
  }
}

/**
 * Middleware for protected routes, redirects to /login if a cookie isn't set yet
 * @param req 
 * @param res 
 * @param next 
 */
function checkAuthentication(req: Request, res: ExpressResponse, next: NextFunction) {
  if (app.locals.cookie && req.originalUrl.split('?')[0] === '/login') {
    res.redirect('/')
  } else if (app.locals.cookie || req.originalUrl.split('?')[0] === '/login') {
    next()
  } else {
    res.redirect('/login')
  }
}

export { checkAuthentication }
export default { checkResponse }
