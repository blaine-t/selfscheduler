import { app } from '..'
import interval from 'interval-promise'
import socketio from './socketio'

/**
 * Creates an interval to send enrollment requests
 * @param termCode
 * @param ms
 */
function enrollInterval(termCode: string, ms: number) {
  console.log(`Setting interval to enroll every ${ms} ms`)
  interval(async () => {
    try {
      await socketio.enroll(termCode)
      console.log(`Enrollment attempt successful at ${app.locals.stamp()}`)
    } catch (err) {
      console.error(
        `Enrollment attempt failed at ${app.locals.stamp()} - ${err}`
      )
    }
  }, ms)
}

export default { enrollInterval }
