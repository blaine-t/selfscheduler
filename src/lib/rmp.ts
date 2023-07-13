import { app } from '..'

//TODO: ADD BETTER ERROR HANDLING

// Used to simplify the request sent to RMP endpoint
async function graphqlRequest(postBody: string) {
  const fetchArgs = {
    method: 'POST',
    // BASE64 for test:test :facepalm:
    headers: { Authorization: 'Basic dGVzdDp0ZXN0' },
    body: postBody,
  }
  try {
    const response = await fetch(
      'https://www.ratemyprofessors.com/graphql',
      fetchArgs,
    )
    return await response.json()
  } catch (err) {
    return err
  }
}

// Find the school ID of the school if not provided
async function schoolID() {
  const postBody = `{ "query":"query NewSearchSchoolsQuery { newSearch { schools(query: { text: \\"${app.locals.SUBDOMAIN}\\" }) { edges { node { id } } } } }" }`
  try {
    const jsonResponse = await graphqlRequest(postBody)
    app.locals.rmpSchoolID =
      jsonResponse['data']['newSearch']['schools']['edges'][0]['node']['id']
  } catch (err) {
    console.error(err)
  }
}

// Retrieves the professor's unique ID from RMP using their name
async function getProfessorId(professor: string) {
  const postBody = `{ "query": "query NewSearchTeachersQuery { newSearch { teachers(query: { schoolID: \\"${app.locals.rmpSchoolID}\\", text: \\"${professor}\\" }) { edges { node { id } } } } }" }`
  try {
    const jsonResponse = await graphqlRequest(postBody)
    return jsonResponse['data']['newSearch']['teachers']['edges'][0]['node'][
      'id'
    ]
  } catch (err) {
    console.error(`Professor ${professor} ID was not found in RMP DB`)
    return 502
  }
}

// Using the unique ID from RMP pull the professors information
async function getProfessorStats(professor: string) {
  try {
    const postBody = `{ "query": "query TeacherRatingsPageQuery { node(id: \\"${await getProfessorId(
      professor,
    )}\\") { __typename ... on Teacher { id avgRating avgDifficulty numRatings wouldTakeAgainPercent } id } }" }`
    const jsonResponse = await graphqlRequest(postBody)
    return jsonResponse['data']['node']
  } catch (err) {
    console.error(err)
    return 502
  }
}

export default { getProfessorStats, schoolID }
