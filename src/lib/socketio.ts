import io from 'socket.io-client'

import { app } from '../index'
import query from './query'

function connect() {
  // Websocket only because api.collegescheduler.com doesn't support long polling
  const socket = io(app.locals.WS_HOST, {
    transports: ['websocket'],
  })
  return socket
}

async function authorize(socket: SocketIOClient.Socket): Promise<void> {
  const token = await query.accessToken()
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

async function emit(requestType: string, request: object) {
  const socket = connect()
  await authorize(socket)
  return new Promise((resolve) => {
    socket.emit(requestType, request, (callbackResponse: JSON) => {
      resolve(
        listen(
          socket,
          requestType.replace('request', 'response'),
          callbackResponse
        )
      )
    })
  })
}

function listen(
  socket: SocketIOClient.Socket,
  responseType: string,
  callbackResponse: object
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (JSON.stringify(callbackResponse).includes('true')) {
      socket.on(responseType, (response: JSON) => {
        socket.close()
        // TODO: Add notifications
        const returnString = parseAll(responseType, response)
        console.log(returnString)
        resolve(returnString)
      })
    } else {
      reject(
        new Error(
          `${responseType} failed. Response: ${JSON.stringify(
            callbackResponse
          )}`
        )
      )
      // TODO: Add error notification
    }
  })
}

function parseAll(responseType: string, response: Record<string, any>) {
  // Find out what the first key we want to access is
  let key = ''
  if (responseType == 'send-to-cart-response') {
    key = 'sections'
  } else {
    key = 'regNumberResponses'
  }
  if (responseType == 'swap-response') {
    return parse(response[key][0])
  } else {
    let returnString = ''
    response[key].forEach((record: any) => {
      returnString += `${parse(record)}\n\n`
    })
    return returnString
  }
}

function parse(record: Record<string, any>) {
  let returnString = `${record['title']}`
  if (record['topicDescription']) {
    returnString += `\n${record['topicDescription']}`
  }
  if (
    record['instructors'] &&
    record['instructors'][0] &&
    record['instructors'][0]['name']
  ) {
    returnString += `\n${record['instructors'][0]['name']}`
  }
  returnString += `\n${record['regNumber']} - ${record['subjectCode']}${record['courseNumber']}`
  returnString += `\n${record['sectionMessages'][0]['message']}`
  return returnString
}

async function enroll(termCode: string) {
  const request = {
    termCode,
    subdomain: app.locals.SUBDOMAIN,
    type: 'ENROLL_CART',
  }
  return await emit('registration-request', request)
}

async function drop(
  termCode: string,
  regNumberList: string[],
  academicCareerCode: string
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

export interface ClassInfo {
  sectionParameterValues: {
    units: number
    gradingBasis: string
  }
  regNumber: string
  academicCareerCode: string
}

async function swap(
  termCode: string,
  dropRegNumber: string,
  classInfo: ClassInfo
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

async function fastSignup(termCode: string, regNumberList: string[]) {
  await cart(termCode, regNumberList)
  await enroll(termCode)
}

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
