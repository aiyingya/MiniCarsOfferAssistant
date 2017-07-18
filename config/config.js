// wx.getLocation({
//   type: 'wgs84',
//   success: function (res) {
//     Object.assign(location, res)
//     console.log(location)
//   }
// })

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
  device,
  /**
   * latitude :
   * longitude :
   * speed :
   * accuracy :
   */
  // location,
}
