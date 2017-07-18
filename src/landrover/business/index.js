/* eslint-disable */

import {
  container,
  storage as foundationStorage,
  request as foundationRequest,
  generateUUID,
  system,
  px,
  rpx
} from '../foundation/index'

const
  env = FMT_ENV,
  name = FMT_NAME,
  version = FMT_VERSION,
  versionCode = FMT_VERSION_CODE,
  build = FMT_BUILD

const keyWithNamespacePrefix = (key) => {
  if (env === 'prd') {
    return key;
  } else {
    return `${env}_${key}`
  }
}

const storageProxy = new Proxy(foundationStorage, {
  get: function (target, name, receiver) {
    if (name in target.__proto__) {
      if (
        name === 'getItem' ||
        name === 'getItemSync' ||
        name === 'setItem' ||
        name === 'setItemSync' ||
        name === 'removeItem' ||
        name === 'removeItemSync'
      ) {
        return function (key, value) {
          key = keyWithNamespacePrefix(key)
          const originalMethod = Reflect.get(target, name, receiver)
          return originalMethod.call(target, key, value)
        }
      }
    }

    return Reflect.get(target, name, receiver);
  }
})

const requestProxy = new Proxy(foundationRequest, {})

/**
 * device
 */
const device = {}
const deviceId = storageProxy.getItemSync('deviceId')
if (deviceId != null && deviceId.length > 0) {
  device.deviceId = deviceId
  console.info(`设备 Id 为 ${deviceId} 从本地缓存取出`)
} else {
  const newDeviceId = generateUUID()
  if (storageProxy.setItemSync('deviceId', newDeviceId)) {
    device.deviceId = newDeviceId
    console.info(`设备 Id 为 ${newDeviceId} 新建 id`)
  } else {
    console.error('同步设置 deviceId 发生错误')
  }
}
console.info(device)

const
  request = requestProxy,
  storage = storageProxy

export {
  env,
  name,
  version,
  versionCode,
  build,
  device,
  system,
  request,
  storage,
  container
}
