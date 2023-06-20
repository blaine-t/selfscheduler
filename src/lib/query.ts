import util from './util'

async function accessToken() {
  try {
    const jsonResponse = await util.requestJson(
      '/api/oauth/student/client-credentials/token'
    )
    const accessToken = jsonResponse['accessToken']
    return accessToken
  } catch (err) {
    console.error(err)
    throw Error('Access token request invalid')
  }
}

async function userInfo(termString: string) {
  try {
    const jsonResponse = await util.requestJson('/api/app-data')
    const userId = String(jsonResponse['studentUserId'])
    for (const term of jsonResponse['terms']) {
      if (term['id'] == termString) {
        return [userId, term['code']]
      }
    }
    throw Error('No matching term code')
  } catch (err) {
    console.error(err)
    throw Error('User info request invalid')
  }
}

export default { accessToken, userInfo }
