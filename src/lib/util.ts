import { app } from '..'
import cookie from './cookie'

async function requestJson(endpoint: string) {
  const response = await fetch(
    `${app.locals.HOST}${endpoint}`,
    app.locals.defaultFetchArgs()
  )
  if (response.status !== 200) {
    throw Error(
      `Provided cookie was invalid with status code ${response.status}`
    )
  }
  // Extract the set-cookie header and update the cookie if possible
  cookie.extract(response)
  return await response.json()
}

function getByValue(map: Map<unknown, unknown>, searchValue: unknown) {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key
    }
  }
  return null
}

export default { requestJson, getByValue }
