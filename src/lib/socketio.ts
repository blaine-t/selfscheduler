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
        console.log('Authorize')
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
  console.log('emit')
  return new Promise((resolve) => {
    socket.emit(requestType, request, (callbackResponse: object) => {
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
): Promise<object> {
  return new Promise((resolve, reject) => {
    if (JSON.stringify(callbackResponse).includes('true')) {
      socket.on(responseType, (response: object) => {
        socket.close()
        console.log(JSON.stringify(response))
        // TODO: Add notifications
        resolve(response)
      })
    } else {
      reject(new Error())
      // TODO: Add error notification
    }
  })
}

async function enroll(termCode: string) {
  const request = {
    subdomain: app.locals.SUBDOMAIN,
    type: 'ENROLL_CART',
    termCode,
  }
  await emit('registration-request', request)
}

async function drop(
  termCode: string,
  regNumberList: string[],
  academicCareerCode: string
) {
  const request = {
    regNumberRequests: [] as {
      action: string
      regNumber: string
      academicCareerCode: string
    }[],
    subdomain: app.locals.SUBDOMAIN,
    termCode,
    type: 'EDIT',
  }
  regNumberList.forEach((regNumber) => {
    request.regNumberRequests.push({
      action: 'DROP',
      regNumber,
      academicCareerCode,
    })
  })
  await emit('registration-request', request)
}

async function cart(termCode: string, regNumberList: string[]) {
  const request = {
    nativeCartRequest: true,
    sections: [] as { regNumber: string; action: string }[],
    termCode,
    environment: app.locals.SUBDOMAIN,
  }
  // For each combination in classAction add that to be a new section in request
  regNumberList.forEach((regNumber) => {
    request.sections.push({ regNumber, action: 'PUT' })
  })
  await emit('send-to-cart-request', request)
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

  await emit('swap-request', request)
}

async function fastSignup(termCode: string, regNumberList: string[]) {
  await cart(termCode, regNumberList)
  await enroll(termCode)
}

export default { cart, drop, enroll, swap, fastSignup }
