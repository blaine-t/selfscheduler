import { app } from '..'
import socketio from './socketio'

/**
 * Creates an interval to send enrollment requests
 * @param termCode
 * @param ms
 */
function setEnrollInterval(termCode: string, ms: number) {
  console.log(`${app.locals.stamp()} Setting interval to enroll every ${ms} ms`)
  // setInterval doesn't call the function initially so we do that ourselves
  enrollRequest(termCode)
  app.locals.enrollInterval = setInterval(() => enrollRequest(termCode), ms)
}

async function enrollRequest(termCode: string) {
  try {
    await socketio.enroll(termCode)
    console.log(`${app.locals.stamp()} Enrollment attempt successful`)
  } catch (err) {
    console.error(`${app.locals.stamp()} Enrollment attempt failed - ${err}`)
  }
}

export default { setEnrollInterval }
