import io from 'socket.io-client'

import { app } from '../index'
import query from './query'
import util from './util'

// Initialize connection to socket.io server
function connect() {
  // Websocket only because api.collegescheduler.com doesn't support long polling
  const socket = io(app.locals.WS_HOST, {
    transports: ['websocket'],
  })
  return socket
}

// Send access token to the server to authenticate websocket
async function authorize(socket: SocketIOClient.Socket): Promise<void> {
  const token = app.locals.accessToken
    ? app.locals.accessToken
    : await query.accessToken()
  return new Promise((resolve, reject) => {
    socket.emit('authorize', { token }, (authResponse: object) => {
      // Check if callback says success true or false
      if (JSON.stringify(authResponse).includes('true')) {
        resolve()
      } else {
        reject(new Error('Authorization failed'))
      }
    })
  })
}

// Emits the data to the socket required for the given request
async function emit(requestType: string, request: object) {
  const socket = connect()
  await authorize(socket)
  return new Promise((resolve) => {
    socket.emit(requestType, request, (callbackResponse: JSON) => {
      console.info(`${app.locals.stamp()} ${requestType} sent`)
      resolve(
        listen(
          socket,
          requestType.replace('request', 'response'),
          callbackResponse,
        ),
      )
    })
  })
}

// Listens for the callback after data is emitted to the socket
function listen(
  socket: SocketIOClient.Socket,
  responseType: string,
  callbackResponse: object,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (JSON.stringify(callbackResponse).includes('true')) {
      socket.on(responseType, (response: JSON) => {
        socket.close()
        const returnArray = parseAll(responseType, response)
        util.sendNotification(returnArray)
        resolve(returnArray)
      })
    } else {
      reject(
        new Error(
          `${responseType} failed. Response: ${JSON.stringify(
            callbackResponse,
          )}`,
        ),
      )
      // TODO: Add error notification
    }
  })
}

// Parses all of the JSON data returned from the callback
function parseAll(responseType: string, response: Record<string, any>) {
  // Find out what the first key we want to access is
  let key = ''
  if (responseType == 'send-to-cart-response') {
    key = 'sections'
  } else {
    key = 'regNumberResponses'
  }
  const notification: string[] = []
  response[key].forEach((record: any) => {
    notification.push(parse(record))
  })
  return notification
}

// Parses individual items of the JSON data from the callback
function parse(record: Record<string, any>) {
  let returnString = `${record.title}`
  if (record.topicDescription) {
    returnString += `💀${record.topicDescription}`
  }
  if (
    record.instructors?.[0]?.name
  ) {
    returnString += `💀${record.instructors[0].name}`
  }
  returnString += `💀${record.regNumber} - ${record.subjectCode}${record.courseNumber}`
  returnString += `💀${record.sectionMessages[0].message}✨${record.sectionMessages[0].severity}`
  return returnString
}

// Attempts to enroll all classes in the shopping cart
async function enroll(termCode: string) {
  const request = {
    termCode,
    subdomain: app.locals.SUBDOMAIN,
    type: 'ENROLL_CART',
  }
  return await emit('registration-request', request)
}

// Drops a class that a student is currently enrolled in
async function drop(
  termCode: string,
  regNumberList: string[],
  academicCareerCode: string,
) {
  const request = {
    termCode,
    regNumberRequests: [] as {
      action: string
      regNumber: string
      academicCareerCode: string
    }[],
    subdomain: app.locals.SUBDOMAIN,
    type: 'EDIT',
  }
  regNumberList.forEach((regNumber) => {
    request.regNumberRequests.push({
      regNumber,
      academicCareerCode,
      action: 'DROP',
    })
  })
  return await emit('registration-request', request)
}
/*
  Adds or removes items from the cart
  (Cart is not persistent for some stupid reason 
  so you just put what classes you want and had in the cart previously)
*/
async function cart(termCode: string, regNumberList: string[]) {
  const request = {
    termCode,
    sections: [] as { regNumber: string; action: string }[],
    environment: app.locals.SUBDOMAIN,
    nativeCartRequest: true,
  }
  // For each combination in classAction add that to be a new section in request
  regNumberList.forEach((regNumber) => {
    request.sections.push({ regNumber, action: 'PUT' })
  })
  return await emit('send-to-cart-request', request)
}

// Interface used to send class to swap in for swap
export interface ClassInfo {
  sectionParameterValues: {
    units: number
    gradingBasis: string
  }
  regNumber: string
  academicCareerCode: string
}

// Swaps a new class in for an existing class
// Will not remove old class if new class not available
async function swap(
  termCode: string,
  dropRegNumber: string,
  classInfo: ClassInfo,
) {
  const request = {
    termCode,
    dropRegNumber,
    sections: [
      {
        ...classInfo,
      },
    ],
    environment: app.locals.SUBDOMAIN,
  }

  return await emit('swap-request', request)
}

// Immediately adds to cart and attempts to enroll the cart for fastest enrolling
async function fastSignup(termCode: string, regNumberList: string[]) {
  await cart(termCode, regNumberList)
  await enroll(termCode)
}

// All functions below this line are to test functions to ensure support
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function test() {
  const termCode = '1238'
  const regNumberList3 = ['7497', '10458', '2111']
  const regNumberList2 = ['7497', '10458']
  const regNumberList1 = ['7497']
  const academicCareerCode = 'UGRD'
  const classInfo = {
    sectionParameterValues: { units: 1, gradingBasis: 'GRD' },
    regNumber: regNumberList2[1],
    academicCareerCode,
  }
  await cart(termCode, regNumberList3)
  await delay(15000)
  await fastSignup(termCode, regNumberList2)
  await delay(15000)
  await drop(termCode, regNumberList2, academicCareerCode)
  await delay(15000)
  await fastSignup(termCode, regNumberList1)
  await delay(15000)
  await swap(termCode, regNumberList1[0], classInfo)
  await delay(15000)
  await drop(termCode, [regNumberList2[1]], academicCareerCode)
  await delay(15000)
  await fastSignup(termCode, regNumberList3)
  await delay(15000)
  await drop(termCode, regNumberList3, academicCareerCode)
}

async function customTest() {
  // Add socketio code to test here
}

export default { cart, drop, enroll, swap, fastSignup, test, customTest }
