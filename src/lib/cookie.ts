import interval from 'interval-promise'

import { app } from '..'

/**
 * Schedules session refreshing with the REFRESH_INTERVAL interval
 */
function scheduleRefresh() {
  if (app.locals.currentlyRefreshing) return

  app.locals.currentlyRefreshing = true
  let fails = 0
  interval(async (iteration, stop) => {
    try {
      await refresh()
      fails = 0
    } catch (err) {
      fails++
      console.error(`${app.locals.stamp()} Refresh failed - ${err}`)
      // if 3 refresh failures in a row, kill the loop
      if (fails >= 3) {
        console.error(
          'Refresh failed 3 times in a row, removing cookie and disabling proxy...',
        )
        app.locals.cookie = null
        app.locals.currentlyRefreshing = false
        stop()
      }
    }
  }, app.locals.REFRESH_INTERVAL)
}

/**
 * Attempts to update app.locals.cookie with a new cookie from the server
 * Also sets app.locals.accessToken, for any socketIO requests to use
 */
async function refresh() {
  // extract set-cookie header from an API response, if it exists
  const response = extract(await checkCookie())
  // errors out if the request fails, so now we can set the accessToken from the response
  const jsonResponse = response.json()
  // we can only do this line because checkCookie specifically calls the token endpoint
  app.locals.accessToken =
    'accessToken' in jsonResponse ? jsonResponse.accessToken : null
}

/**
 * Updates the app cookie by extracting a new one from the Set-Cookie
 * header of a response to an authenticated server request.
 * @param response
 * @returns the same response
 */
function extract(response: Response) {
  // if no set-cookie header is returned, this cookie isn't old enough to be refreshed
  // so just exit since the cookie's still valid
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) {
    return response
  }

  // parse out the AspNet cookie string
  app.locals.cookie = setCookie.split('.AspNet.Cookies=')[1].split(';')[0]
  console.info(
    `${app.locals.stamp()} Refreshed cookie to ${app.locals.cookie.slice(
      0,
      10,
    )}...`,
  )
  return response
}

/**
 * Checks if the app cookie belongs to a valid session by making a request.
 * Throws an error if the cookie is invalid, returns the response if it is.
 */
async function checkCookie() {
  // this URL can be any /api endpoint, this uses the token endpoint to get the token too if you want it
  const url = `${app.locals.HOST}/api/oauth/student/client-credentials/token`
  const response = await fetch(url, app.locals.defaultFetchArgs())

  if (response.status !== 200) {
    throw Error(
      `Provided cookie was invalid with status code ${response.status}`,
    )
  }
  return response
}

export default { scheduleRefresh, extract, checkCookie }
