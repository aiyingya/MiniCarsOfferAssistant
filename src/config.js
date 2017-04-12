import Util from './utils/util'

/**
 * 基础配置文件
 */
const ENV = 'gqc'
const name = 'yaomaiche-miniprogram'
const version = '1.4.0'
const build = 1
const versionCode = '010400'

const system = {}
try {
  const wxSystemInfo = wx.getSystemInfoSync()
  if (wxSystemInfo.hasOwnProperty('SDKVersion')) {
    // 拥有这个字段就是 1.1.0 之后的版本
  } else {
    // 没有这个字段说明是 1.1.0 之前的版本，目前全部设置为 1.0.0
    wxSystemInfo.SDKVersion = '1.0.0'
    wxSystemInfo.screenHeight = 0
    wxSystemInfo.screenWidth = 0
  }

  {
    // 生成 SDKVersionCode
    const SDKVersion = wxSystemInfo.SDKVersion
    const [MAJOR, MINOR, PATCH] = SDKVersion.split('.').map(Number)
    wxSystemInfo.SDKVersionCode = MAJOR * 10000 + MINOR * 100 + PATCH
  }

  {
    const version = wxSystemInfo.version
    const [MAJOR, MINOR, PATCH] = version.split('.').map(Number)
    wxSystemInfo.versionCode = MAJOR * 10000 + MINOR * 100 + PATCH
  }
  Object.assign(system, wxSystemInfo)
} catch (e) {
  console.error(e)
}
console.info(system)

const device = {}
try {
  const deviceId = wx.getStorageSync('deviceId')
  if (deviceId && deviceId.length) {
    device.deviceId = deviceId
    console.info(`设备 Id 为 ${deviceId} 从本地缓存取出`)
  } else {
    const newDeviceId = Util.generateUUID()
    try {
      wx.setStorageSync('deviceId', newDeviceId)
      device.deviceId = newDeviceId
      console.info(`设备 Id 为 ${newDeviceId} 新建 id`)
    } catch (e) {
      console.error(e)
    }
  }
} catch (e) {
  console.error(e)
}
console.info(device)

export default {
  /**
   * 环境变量
   */
  ENV,
  /**
   * 小程序的名字, package.json name
   */
  name,
  /**
   * 小程序业务版本号, package.json version
   */
  version,
  /**
   * 小程序业务版本 code, package.json versionCode
   */
  versionCode,
  /**
   * 小程序构件号, package.json build
   */
  build,
  /**
   * SDKVersion : "1.1.0"
   * SDKVersionCode : "10100"
   * language : "zh_CN"
   * model : "iPhone 6"
   * pixelRatio : 2
   * platform : "devtools"
   * screenHeight : 627
   * screenWidth : 375
   * system : "iOS 10.0.1"
   * version : "6.5.6"
   * versionCode : 60506
   * windowHeight : 571
   * windowWidth : 375
   */
  system,
  /**
   * deviceId : ''
   */
  device
}
