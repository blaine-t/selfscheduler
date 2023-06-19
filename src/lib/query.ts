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

async function userInfo(termString: string) {
  const url = `${app.locals.HOST}/api/app-data`
  const response = await fetch(url, app.locals.defaultFetchArgs())
  try {
    const jsonResponse = await util.checkResponse(response)
    const userId = String(jsonResponse['studentUserId'])
    for (const term of jsonResponse['terms']) {
      if (term['id'] == termString) {
        return [userId, term['code']]
      }
    }
    throw Error('No matching term code')
  } catch (err) {
    throw Error('User info request invalid')
  }
}

export default { accessToken, userInfo }
