import { app } from '../index'
import util from './util'

async function accessToken() {
  const url = `${app.locals.HOST}/api/oauth/student/client-credentials/token`
  const response = await fetch(url, app.locals.defaultFetchArgs())

  try {
    const jsonResponse = await util.checkResponse(response)
    const accessToken = jsonResponse['accessToken']
    return accessToken
  } catch (err) {
    console.error(err)
    throw Error('Access token request invalid')
  }
}

export default { accessToken }
