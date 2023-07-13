// Import Response as ExpressResponse because of conflict with fetch Response type
import { Response as ExpressResponse } from 'express'

import { app } from '..'
import cookie from './cookie'

// Automatically error handles requesting the JSON of a URL
async function requestJson(endpoint: string) {
  const response = await fetch(
    `${app.locals.HOST}${endpoint}`,
    app.locals.defaultFetchArgs(),
  )
  // the API responds with 302 if cookie is bad, 5XX if some server error
  // which happens sometimes, and 4XX if some client request error
  // we'll only error on 302 and 5XX
  if (response.status !== 200 && !response.status.toString().startsWith('4')) {
    throw Error(`API request failed with status code ${response.status}`)
  }
  // Extract the set-cookie header and update the cookie if possible
  cookie.extract(response)
  return await response.json()
}

// Not in use currently
function getByValue(map: Map<unknown, unknown>, searchValue: unknown) {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key
    }
  }
  return null
}

// Send notifications to all connected clients
function sendNotification(notifications: string[]) {
  app.locals.clients.forEach((client: ExpressResponse) => {
    notifications.forEach((notification) => {
      client.write('event: notification\n')
      client.write(`data: ${notification}\n\n`)
    })
  })
}

export default { requestJson, getByValue, sendNotification }
