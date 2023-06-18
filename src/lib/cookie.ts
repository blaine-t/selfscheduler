import fetch from 'node-fetch'

async function refresh(host: string, cookie: string) {
  const response = await fetch(`${host}/api/terms/`, {
    redirect: 'manual',
    headers: {
      cookie: `.AspNet.Cookies=${cookie}`,
    },
  })

  // if response code is 302, the provided cookie is invalid
  if (response.status === 302) {
    throw Error('Provided cookie was invalid, unable to refresh')
  }

  // if no set-cookie header is returned, this cookie isn't old enough to be refreshed
  // so just return the same cookie, it's still valid
  if (!('set-cookie' in response.headers.raw())) {
    return cookie
  }

  // parse out the AspNet cookie string
  return response.headers
    .raw()
    ['set-cookie'].filter((value) => value.startsWith('.AspNet.Cookies='))[0]
    .split('.AspNet.Cookies=')[1]
    .split(';')[0]
}

export default {
  refresh,
}
