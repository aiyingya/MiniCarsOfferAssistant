import config from '../config'
import * as wxapi from 'wxapp-promise'

export default class YMC {
  /**
   *
   *
   * @param {any} options
   * @returns
   *
   * @memberOf YMC
   */
  requestByPromise(options) {
    if (!options) return null

    return new Promise((resolve, reject) => {
      let clientId = ''
      try {
        // FIXME: 处理 clientId 使用同步获取相对较重
        clientId = wx.getStorageSync('clientId')
      } catch (e) {
        console.error(e)
      }

      const defaultHeader = {
        'ClientId': clientId,
        'ClientVersion': config.versionCode,
        'SystemCode': '60',
        'content-type': options.contentType || 'application/json'
      }
      const header = options.header || {}

      wx.request({
        url: options.url,
        data: options.data,
        header: Object.assign(defaultHeader, header),
        method: options.method || 'GET',
        /**
         * 微信成功回调
         *
         * @param {Object} res
         * @param {String} res.errMsg
         * @param {Number} res.statusCode
         * @param {Object} res.data
         */
        success(res) {
          console.log('success')
          console.log(res)
          const result = res.data
          const statusCode = res.statusCode

          // 新版 uc 接口使用 behavior 来处理额外行为，
          const behavior = result.behavior || null
          if (behavior) {
            if (behavior.type === 'TOAST') {
              let content = behavior.content
              if (content && content.length) {
                // 暂不实现
              }
            } else if (behavior.type === 'Alert') {
              // 暂不实现
            } else if (behavior.type === 'Notice') {
              // 暂不实现
            }
          }

          if (statusCode < 399) {
            // 2XX, 3XX 成功
            const data = result.data || null
            resolve(data)
          } else {
            // 4XX, 5XX 失败
            console.error(res)
            let err
            if (typeof result === 'object') {
              // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
              // 服务端可以处理的错误
              const error = result.error || null
              const errorMessage = error.message || error.alertMessage
              err = new Error(errorMessage)
              reject(err)
            } else {
              err = new Error(result)
              reject(err)
            }
          }
        },
        /**
         * 微信失败回调
         *
         * @param {Object} err
         * @param {String} err.errMsg
         */
        fail(err) {
          console.log('fail')
          console.error(err)
          const error = new Error('网络请求错误')
          reject(error)
        },
        complete() {}
      })
    })
  }

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
  request(options) {
    if (!options) return

    let loadingType = options.loadingType

    if (options.loadingType === 'navigation') {
      console.log('显示导航栏加载')
      wx.showNavigationBarLoading()
    } else if (options.loadingType === 'none') {
      // 不使用任何加载
    } else {
      wx.showToast({
        title: '正在加载',
        icon: 'loading',
        duration: 10000,
        mask: true
      })
    }

    try {
      // FIXME: 处理 clientId 使用同步获取相对较重
      let clientId = wx.getStorageSync('clientId')

      const defaultHeader = {
        'ClientId': clientId,
        'ClientVersion': config.versionCod,
        'SystemCode': '60',
        'content-type': options.contentType || 'application/json'
      }
      const header = options.header || {}

      wx.request({
        url: options.url,
        method: options.method,
        data: options.data,
        header: Object.assign(defaultHeader, header),
        success(res) {

          console.log('success')
          console.log(res)
          const result = res.data
          const statusCode = res.statusCode

          // 新版 uc 接口使用 behavior 来处理额外行为，
          const behavior = result.behavior || null
          if (behavior) {
            if (behavior.type === 'TOAST') {
              let content = behavior.content
              if (content && content.length) {
                // 暂不实现
              }
            } else if (behavior.type === 'Alert') {
              // 暂不实现
            } else if (behavior.type === 'Notice') {
              // 暂不实现
            }
          }

          if (statusCode < 399) {
            // 2XX, 3XX 成功
            const data = result.data || null
            typeof options.success === 'function' && options.success(data)
          } else {
            // 4XX, 5XX 失败
            console.error(res)
            let err
            if (typeof result === 'object') {
              // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
              // 服务端可以处理的错误
              const error = result.error || null
              const errorMessage = error.message || error.alertMessage
              err = new Error(errorMessage)
              typeof options.fail === 'function' && options.fail(err)
            } else {
              err = new Error(result)
              typeof options.fail === 'function' && options.fail(err)
            }
          }
        },
        fail(err) {
          console.log('fail')
          console.error(err)
          const error = new Error('网络请求错误')
          typeof options.fail === 'function' && options.fail(error)
        },
        complete: function () {
          if (options.loadingType === 'navigation') {
            console.log('隐藏导航栏加载')
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
        console.log('隐藏导航栏加载')
        wx.hideNavigationBarLoading()
      } else if (options.loadingType === 'none') {
        // 不使用任何加载
      } else {
        wx.hideToast()
      }

      const error = new Error('网络请求错误')
      typeof options.fail === 'function' && options.fail(error)
      typeof options.complete === 'function' && options.complete()
    }
  }


  /**
   * request
   * @param options
   * url          加载的 url
   * method       加载的 http 方法
   * data         加载的数据体
   * header       加载请求所使用的 header
   * success      成功回调
   * fail         失败回调
   * complete     完成回调
   */
  requestPromise(options) {
    if (!options) return null

    let clientId = ''
    try {
      // FIXME: 处理 clientId 使用同步获取相对较重
      clientId = wx.getStorageSync('clientId')
    } catch (e) {
      console.error(e)
    }

    const defaultHeader = {
      'ClientId': clientId,
      'ClientVersion': config.versionCode,
      'SystemCode': '60',
      'content-type': options.contentType || 'application/json'
    }
    const header = options.header || {};

    wxapi.request({
      url: options.url,
      data: options.data,
      header: Object.assign(defaultHeader, header),
      method: options.method || 'GET'
    }).then(res=>{

      console.log('success',res)
      const result = res.data
      const statusCode = res.statusCode

      // 新版 uc 接口使用 behavior 来处理额外行为，
      const behavior = result.behavior || null
      if (behavior) {
        if (behavior.type === 'TOAST') {
          let content = behavior.content
          if (content && content.length) {
            // 暂不实现
          }
        } else if (behavior.type === 'Alert') {
          // 暂不实现
        } else if (behavior.type === 'Notice') {
          // 暂不实现
        }
      }

      if (statusCode < 399) {
        // 2XX, 3XX 成功
        const data = result.data || null
        if(options.success && typeof(options.success) ==='function'){
          options.success(data)
        }

      } else {
        // 4XX, 5XX 失败
        // console.error(res)
        let err
        if (typeof result === 'object') {
          // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
          // 服务端可以处理的错误
          const error = result.error || null
          const errorMessage = error.message || error.alertMessage
          err = new Error(errorMessage)
          if(options.fail && typeof(options.fail) ==='function'){
            options.fail(err)
          }
        } else {
          err = new Error(result)
          if(options.fail && typeof(options.fail) ==='function'){
            options.fail(err)
          }
        }
      }
    },fail=>{
      console.log('fail',fail)
      const error = new Error('网络请求错误');
      if(options.fail && typeof(options.fail) ==='function'){
        options.fail(error)
      }
    }).catch(function (reason) {
      // 抛出一个全局错误
      console.log('catch',reason)
      if(options.fail && typeof(options.fail) ==='function'){
        options.fail(reason)
      }
    }).finally(options.complete || function () {});

  }


}
