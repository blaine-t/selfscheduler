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
      console.error(`Refresh failed at ${app.locals.stamp()} - "${err}"`)
      // if 3 refresh failures in a row, kill the loop
      if (fails >= 3) {
        console.error(
          'Refresh failed 3 times in a row, removing cookie and disabling proxy...'
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
 */
async function refresh() {
  extract(await checkCookie())
}

/**
 * Updates the app cookie by extracting a new one from the Set-Cookie
 * header of a response to an authenticated server request.
 * @param response
 * @returns
 */
function extract(response: Response) {
  // if no set-cookie header is returned, this cookie isn't old enough to be refreshed
  // so just exit since the cookie's still valid
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) {
    return
  }

  // parse out the AspNet cookie string
  app.locals.cookie = setCookie.split('.AspNet.Cookies=')[1].split(';')[0]
  console.info(
    `Refreshed cookie to ${app.locals.cookie.slice(
      0,
      10
    )}... at ${app.locals.stamp()}`
  )
}

/**
 * Checks if the app cookie belongs to a valid session by making a request.
 * Throws an error if the cookie is invalid, returns the response if it is.
 */
async function checkCookie() {
  const url = `${app.locals.HOST}/api/terms/`
  const response = await fetch(url, app.locals.defaultFetchArgs())

  if (response.status !== 200) {
    throw Error(
      `Provided cookie was invalid with status code ${response.status}`
    )
  }
  return response
}

export default { scheduleRefresh, extract, checkCookie }
