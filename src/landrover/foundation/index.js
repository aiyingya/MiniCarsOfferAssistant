// @flow
import container from './adaptor/container'
import Request from './adaptor/request'
import Storage from './adaptor/storage'

import { system, px, rpx } from './adaptor/system'

const request = new Request()
const storage = new Storage()

const generateUUID = function () {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
  })
  return uuid
}

export {
  container,
  request,
  storage,
  generateUUID,
  system,
  px,
  rpx
}
