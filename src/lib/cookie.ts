import { Express } from 'express'
import fetch, { Headers } from 'node-fetch'

async function refresh(app: Express) {
  const response = await fetch(`${app.locals.HOST}/api/terms/`, {
    redirect: 'manual',
    headers: new Headers({
      cookie: `.AspNet.Cookies=${app.locals.cookie}`,
      'User-Agent': app.locals.USERAGENT,
    }),
  })

  // if response code is 302, the provided cookie is invalid
  if (response.status === 302) {
    throw Error('Provided cookie was invalid, unable to refresh')
  }

  // if no set-cookie header is returned, this cookie isn't old enough to be refreshed
  // so just exit since the cookie's still valid
  if (!('set-cookie' in response.headers.raw())) {
    return
  }

  // parse out the AspNet cookie string
  app.locals.cookie = response.headers
    .raw()
    ['set-cookie'].filter((value) => value.startsWith('.AspNet.Cookies='))[0]
    .split('.AspNet.Cookies=')[1]
    .split(';')[0]
}

export default {
  refresh,
}
