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
  // Craft and send response to endpoint for keepalive
  const url = `${app.locals.HOST}/api/terms/`
  const response = await fetch(url, app.locals.defaultFetchArgs())

  // Take out the cookie from the response
  extract(response)
}

function extract(response: Response) {
  // if response code is not 200, the provided cookie is invalid
  if (response.status !== 200) {
    throw Error(
      `Provided cookie was invalid with status code ${response.status}, unable to refresh`
    )
  }

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

export { refresh }

export default { scheduleRefresh, extract }
