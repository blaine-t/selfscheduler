async function checkResponse(response: Response) {
  if (response.status !== 200) {
    throw Error(
      `Provided cookie was invalid with status code ${response.status}`
    )
  }
  try {
    const jsonResponse = await response.json()
    return jsonResponse
  } catch (err) {
    return err
  }
}

export default { checkResponse }
