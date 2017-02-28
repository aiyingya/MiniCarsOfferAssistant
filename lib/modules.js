/**
 * request
 * @param options
 * loadingType  用来设置网络请求时的加载样式，默认为 toast 类型 toast/navigation/none
 * url          加载的 url
 * method       加载的 http 方法
 * data         加载的数据体
 * header       加载请求所使用的 header
 * success      成功回调
 * fail         失败回调
 * complete     完成回调
 */
function xmlHTTPRquest(options) {
  if(!options) return;

  let loadingType = options.loadingType

  if (options.loadingType === 'navigation') {
    console.log("显示导航栏加载")
    wx.showNavigationBarLoading()
  } else if (options.loadingType === 'none') {
    // 不使用任何加载
  } else {
    wx.showToast({
      title: "正在加载",
      icon: 'loading'
    })
  }

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
      success (res) {
        let result = res.data
        /// MARK: 在早期安卓版本微信中，需要对没有正确序列化的返回对象做去 bom 头的处理
				if(result) {
					if (typeof result === 'string') {
						result = JSON.parse(result.trim())
					}
				}
        
        if (result.behavior) {
          // 新版 uc 接口使用 behavior 来处理额外行为
          if (result.behavior.type === 'TOAST') {
            let content = result.behavior.content
            if (content && content.length) {
              console.log(content)
            }
          } else if (result.behavior.type === 'Alert') {
            // 暂不实现
          } else if (result.behavior.type === 'Notice') {
            // 暂不实现
          }
        }

        if (result.error) {
          // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
          // 服务端可以处理的错误

          typeof options.fail === 'function' && options.fail(result.error)
        } else { 
					// 返回体中有数据返回
					typeof options.success === 'function' && options.success(result.data)
          
        }
      },
      fail (error) {
        if (typeof error === 'object') {
          let alertMessage = error.alertMessage
          if (alertMessage) {
            typeof options.fail === 'function' && options.fail(error)
          } else {
            typeof options.fail === 'function' && options.fail({
              alertMessage: '网络请求错误， 请稍后再试',
              error: error
            })
          }
        } else {
          typeof options.fail === 'function' && options.fail({
            alertMessage: '网络请求错误， 请稍后再试',
            error: error
          })
        }
        // 服务端无法处理的错误
      },
      complete: function() {
        if (options.loadingType === 'navigation') {
          console.log("隐藏导航栏加载")
          wx.hideNavigationBarLoading()
        } else if (options.loadingType === 'none') {
          // 不使用任何加载
        } else {
          wx.hideToast()
        }

        typeof options.complete === 'function' && options.complete()
      }
    })
  } catch (e) {
    if (options.loadingType === 'navigation') {
      console.log("隐藏导航栏加载")
      wx.hideNavigationBarLoading()
    } else if (options.loadingType === 'none') {
      // 不使用任何加载
    } else {
      wx.hideToast()
    }

    typeof options.fail === 'function' && options.fail(error)
    typeof options.complete === 'function' && options.complete()
  }
}

module.exports = {
  request: xmlHTTPRquest
}