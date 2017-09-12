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

const px = (rpx) => {
  return (system.screenWidth * rpx) / 750
}

const rpx = (px) => {
  return (750 * px) / system.screenWidth
}

export {
  system,
  px,
  rpx
}
