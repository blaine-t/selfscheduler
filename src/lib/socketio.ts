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
  socket.emit(requestType, request, (callbackResponse: object) => {
    listen(socket, requestType.replace('request', 'response'), callbackResponse)
  })
}

function listen(
  socket: SocketIOClient.Socket,
  responseType: string,
  callbackResponse: object
) {
  if (JSON.stringify(callbackResponse).includes('true')) {
    socket.on(responseType, (response: object) => {
      socket.close()
      console.log(JSON.stringify(response))
      // TODO: Add notifications
    })
  } else {
    // TODO: Add error notification
  }
}

function enroll(termCode: string) {
  const request = {
    subdomain: app.locals.SUBDOMAIN,
    type: 'ENROLL_CART',
    termCode,
  }
  emit('registration-request', request)
}

function drop(
  regNumberList: string[],
  termCode: string,
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
  emit('registration-request', request)
}

function cart(classAction: Map<string, string>, termCode: string) {
  const request = {
    sections: [] as { regNumber: string; action: string }[],
    termCode,
    environment: app.locals.SUBDOMAIN,
  }
  // For each combination in classAction add that to be a new section in request
  classAction.forEach((value, key) => {
    request.sections.push({ regNumber: key, action: value })
  })
  emit('send-to-cart-request', request)
}

export default { enroll, drop, cart }
