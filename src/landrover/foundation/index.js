// @flow
import container from '../platform/container'
import Request from '../platform/request'
import Storage from '../platform/storage'
import UI from '../platform/ui'

import { system, px, rpx } from '../platform/system'

const request = new Request()
const storage = new Storage()
const ui = new UI()

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
  rpx,
  ui
}
