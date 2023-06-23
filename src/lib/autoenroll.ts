// Import Request, Response for type-safety
import { Request, Response } from 'express'

import { app } from '..'
import socketio from './socketio'

async function postRequest(req: Request, res: Response) {
  switch (req.body.action) {
    // these two are for the enrollment interval form
    case 'clearInterval': {
      console.info(`${app.locals.stamp()} Clearing current enrollment interval`)
      clearInterval(app.locals.enrollInterval)
      app.locals.enrollInterval = null
      // tab dictates redirect to interval or scheduler
      res.redirect('/autoenroll?tab=1')
      break
    }
    case 'setInterval': {
      const term = req.body.term
      const interval = parseInt(req.body.interval) * 1000 // convert from seconds to ms
      if (!term || isNaN(interval)) {
        res.redirect('/autoenroll?tab=1&error=Invalid request')
        break
      }
      // ensure the interval isn't too short
      if (interval < 15000) {
        res.redirect(
          '/autoenroll?tab=1&error=Interval must be greater than 15 seconds'
        )
        break
      }
      // the post request expects the term string e.g. "Fall 2023"
      // we need to convert it to the term code e.g. 1238
      const termIndex = app.locals.terms.indexOf(term)
      if (termIndex === -1) {
        // this shouldn't be possible when term is a dropdown, but we'll handle it anyway
        res.redirect('/autoenroll?tab=1&error=Invalid term')
        break
      }
      const termCode = app.locals.termCodes[termIndex]

      setEnrollInterval(termCode, interval)
      res.redirect('/autoenroll?tab=1')
      break
    }
    // this one is for the scheduler form
    case 'schedule': {
      const term = req.body.term
      const timestamp = Date.parse(req.body.datetime) // unix timestamp
      if (!term || isNaN(timestamp)) {
        res.redirect('/autoenroll?tab=2&error=Invalid request')
        break
      }

      // if they try to schedule a date in the past
      if (timestamp < Date.now()) {
        res.redirect('/autoenroll?tab=2&error=Cannot schedule into the past')
        break
      }
      const termIndex = app.locals.terms.indexOf(term)
      if (termIndex === -1) {
        res.redirect('/autoenroll?tab=2&error=Invalid term')
        break
      }
      const termCode = app.locals.termCodes[termIndex]

      scheduleEnroll(termCode, timestamp)
      res.redirect('/autoenroll?tab=2')
      break
    }
  }
}

/**
 * Creates an interval to send enrollment requests
 * @param termCode
 * @param ms
 */
function setEnrollInterval(termCode: string, ms: number) {
  console.info(
    `${app.locals.stamp()} Setting interval to enroll every ${ms} ms`
  )
  // setInterval doesn't call the function initially so we do that ourselves
  enrollRequest(termCode)
  app.locals.enrollInterval = setInterval(() => enrollRequest(termCode), ms)
}

/**
 * Schedules an enrollment request to be sent at a certain timestamp
 * @param termCode
 * @param timestamp - unix timestamp in ms
 */
function scheduleEnroll(termCode: string, timestamp: number) {
  console.info(
    `${app.locals.stamp()} Scheduling an enroll request for ${new Date(
      timestamp
    )}`
  )
  app.locals.scheduledEnrollments.push(timestamp)
  app.locals.scheduledEnrollments.sort()
  // delay is just target timestamp minus current timestamp
  const delay = timestamp - Date.now()
  setTimeout(() => {
    enrollRequest(termCode)
    // remove the timestamp from the scheduled list after it goes through
    app.locals.scheduledEnrollments = app.locals.scheduledEnrollments.filter(
      (t: number) => t !== timestamp
    )
  }, delay)
}

/**
 * Sends an enroll request to the scheduler, logging potential errors
 * @param termCode
 */
async function enrollRequest(termCode: string) {
  try {
    await socketio.enroll(termCode)
    console.info(`${app.locals.stamp()} Enrollment attempt successful`)
  } catch (err) {
    console.error(`${app.locals.stamp()} Enrollment attempt failed - ${err}`)
  }
}

export default { postRequest, setEnrollInterval, scheduleEnroll }
