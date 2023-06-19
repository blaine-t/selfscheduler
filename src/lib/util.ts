async function checkResponse(response: Response) {
  if (response.status === 302) {
    throw Error('Provided cookie was invalid, unable to refresh')
  }
  try {
    const jsonResponse = await response.json()
    return jsonResponse
  } catch (err) {
    return err
  }
}

export default { checkResponse }
