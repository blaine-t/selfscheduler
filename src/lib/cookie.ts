import schedule from 'node-schedule'
import { app } from '../index'

function scheduleRefresh() {
  refresh()
  // Attempt to refresh the cookie every 10 minutes
  schedule.scheduleJob('*/10 * * * *', async function () {
    refresh()
  })
}

async function refresh() {
  extract(await checkCookie())
}

function extract(response: Response) {

  // if no set-cookie header is returned, this cookie isn't old enough to be refreshed
  // so just exit since the cookie's still valid
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) {
    return
  }

  // parse out the AspNet cookie string
  app.locals.cookie = setCookie.split('.AspNet.Cookies=')[1].split(';')[0]
  console.info(`Refreshed cookie at ${app.locals.stamp()}`)
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

export { checkCookie, scheduleRefresh }

export default { extract }
