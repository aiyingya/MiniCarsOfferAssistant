// wx 封装.

/**
 * wx.request.
 * request.js
 */
function xmlHTTPRquest(options) {
  if(!options) return;

  wx.showToast({
    title: "正在加载",
    icon: 'loading'
  })
  try {
    // FIXME: 处理 clientId 使用同步获取相对较重
    let clientId = wx.getStorageSync('clientId')

    let header = {
      'ClientId': clientId,
      'ClientVersion': '10000',
      'SystemCode': '60',
      'content-type': options.contentType || 'application/json'
    }

    for (var attrname in options.header) { header[attrname] = options.header[attrname]; }

    wx.request({
      url: options.url,
      method: options.method,
      data: options.data,
      header: header,
      success: function(res) {
        let data = res.data
        if (data.behavior) {
          // 新版 uc 接口使用 behavior 来处理额外行为
          if (data.behavior.type === 'TOAST') {
            let content = data.behavior.content
            if (content && content.length) {
              console.log(content)
            }
          } else if (data.behavior.type === 'Alert') {
            // 暂不实现
          } else if (data.hehavior.type === 'Notice') {
            // 暂不实现
          }
        }

        if (data.error) {
          // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
          // 服务端可以处理的错误
          let alertMessage = data.error.alertMessage;
          if (alertMessage && alertMessage.length) {
            console.log(alertMessage)
          }
          if (options.fail && typeof options.fail === 'function') {
            options.fail(data.error)
          }
        } else if (data.data) {
          // 返回体中有数据返回
          if (options.success && typeof options.success === 'function') {
            options.success(data.data)
          }
        } else {
          throw '返回体中既没有 error， 也没有 data， 与约定不符合'
        }
      },
      fail: function() {
        // 服务端无法处理的错误
        if (options.fail && typeof options.fail === 'function') {
          options.fail()
        }
      },
      complete: function() {
        wx.hideToast()
        if (options.complete && typeof options.complete === 'function') {
          options.complete()
        }
      }
    })
  } catch (e) {
    wx.hideToast()
    if (options.fail && typeof options.fail === 'function') {
      options.fail()
    }
    if (options.complete && typeof options.complete === 'function') {
      options.complete()
    }
  }
}

module.exports = {
  request: xmlHTTPRquest
}