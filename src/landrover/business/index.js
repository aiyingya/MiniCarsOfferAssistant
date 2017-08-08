/* eslint-disable */

import {
  container,
  storage,
  request,
  generateUUID,
  system,
  px,
  rpx,
  ui
} from '../foundation/index'

const
  env = FMT_ENV,
  name = FMT_NAME,
  version = FMT_VERSION,
  versionCode = FMT_VERSION_CODE,
  build = FMT_BUILD

const appId = 'wxd5d5bf6b593d886e'

const config = {
  env,
  name,
  version,
  versionCode,
  build,
  appId
}

const keyWithNamespacePrefix = (key) => {
  if (env === 'prd') {
    return key;
  } else {
    return `${env}_${key}`
  }
}

const storagePrototype = Object.getPrototypeOf(storage)
const methods = Object.getOwnPropertyNames(storagePrototype)

methods.forEach(name => {
  const original = storagePrototype[name];

  if (typeof original === 'function') {
    if (
      name === 'getItem' ||
      name === 'getItemSync' ||
      name === 'setItem' ||
      name === 'setItemSync' ||
      name === 'removeItem' ||
      name === 'removeItemSync'
    ) {
      storagePrototype[name] = (key, value) => {
        key = keyWithNamespacePrefix(key)
        return original.call(storage, key, value)
      }
    }
  }
})


/**
 * device
 */
const device = {}
const deviceId = storage.getItemSync('deviceId')
if (deviceId != null && deviceId.length > 0) {
  device.deviceId = deviceId
  console.info(`设备 Id 为 ${deviceId} 从本地缓存取出`)
} else {
  const newDeviceId = generateUUID()
  if (storage.setItemSync('deviceId', newDeviceId)) {
    device.deviceId = newDeviceId
    console.info(`设备 Id 为 ${newDeviceId} 新建 id`)
  } else {
    console.error('同步设置 deviceId 发生错误')
  }
}
console.info(device)

/**
 * util
 */
const util = {
  px,
  rpx
}

export {
  config,
  device,
  system,
  request,
  storage,
  container,
  util,
  ui
}
