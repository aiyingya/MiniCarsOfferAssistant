// @flow

import { request, config, container } from '../landrover/business/index'

import * as wxapi from 'fmt-wxapp-promise'

export default class YMC {
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
  request(options: any) {
    if (!options) return

    let loadingType = options.loadingType

    if (options.loadingType === 'navigation') {
      console.log('显示导航栏加载')
      wxapi.showNavigationBarLoading()
    } else if (options.loadingType === 'none') {
      // 不使用任何加载
    } else {
      console.log("begin show loading",options.url)
      wxapi.showToast({
        title: '正在加载',
        icon: 'loading',
        duration: 10000,
        mask: true
      })
      // setTimeout(function () {
      //   console.log("------  300s close ")
      //
      //   wxapi.hideToast()
      // },3000)
    }

    const userService = container.userService

    const ClientId = userService.clientId
    const ClientVersion = config.versionCode
    const SystemCode = 60
    const Authorization = userService.auth != null ? userService.auth.accessToken : null

    const defaultHeader = {
      Authorization,
      ClientId,
      ClientVersion,
      'content-type': options.contentType || 'application/json',
      SystemCode
    }
    const data = Object.assign({}, options.data)
    const header = Object.assign(defaultHeader, options.header)

    Object.keys(data).forEach((key) => (data[key] == null) && delete data[key]);
    Object.keys(header).forEach((key) => (header[key] == null) && delete header[key]);

    wxapi.request({
      url: options.url,
      method: options.method,
      data: data,
      header: header
    }).then(res=>{
      console.log('request.. success')

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
        console.log('request.. success <399 error',res)
        let err
        if (typeof result === 'object') {
          // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
          // 服务端可以处理的错误
          const error = result.error || null
          const errorMessage = error.message || error.alertMessage
          err = new Error(errorMessage)
        } else {
          err = new Error(result)
        }
        if(typeof options.fail === 'function' ){
          options.fail(err)
          return
        }
        console.log("show fail loading")
        wxapi.showToast({
          title: err.message,
          icon: 'loading',
          duration: 2000
        });
      }
    },err=>{
      console.log('request.. fail')
      const error = new Error('网络请求错误')
      if(typeof options.fail === 'function' ){
        options.fail(error)
        return
      }
      console.log("show fail loading")
      wxapi.showToast({
        title: error.message,
        icon: 'loading',
        duration: 2000
      });
    }).catch(function (e) {
      console.log('request.. catch')

      if (options.loadingType === 'navigation') {
        console.log('隐藏导航栏加载')
        wxapi.hideNavigationBarLoading()
      } else if (options.loadingType === 'none') {
        // 不使用任何加载
      } else {
        console.log("end close loading")

        wxapi.hideToast()
      }

      const error = new Error('网络请求错误')
      console.log("show catch loading")
      wxapi.showToast({
        title: error.message,
        icon: 'loading',
        duration: 2000
      });
    }).finally(function () {
      console.log('request.. finally')
      if (options.loadingType === 'navigation') {
        console.log('隐藏导航栏加载')
        wxapi.hideNavigationBarLoading()
      } else if (options.loadingType === 'none') {
        // 不使用任何加载
      } else {
        console.log("end close loading")

        wxapi.hideToast()
      }
      typeof options.complete === 'function' && options.complete()
    })
  }

  /**
   * 支持 Promise 的请求方法
   *
   * 1.5.1该接口已完成内部返回promise对象 以下方法可以用来替换requestByPromise方法 开发阶段已测试
   * TODO：等下一版本提测的时候给测试验证一下，就不在1.5.1提审了
   *
   * @param {string} [url='']
   * @param {{[string]: ?} [data=string|number]
   * @memberof YMC
   */
  requestByPromise(
    url: string = '',
    data?: {[string]: ? string|number},
    header?: {[string]: ? string|number},
    method?: 'GET'|'POST'|'PUT'|'DELETE'|'OPTIONS'|'HEAD'|'TRACE'|'CONNECT',
    dataType?: 'json',
    loadingType?: 'none'
  ): Promise<any> {

    const userService = container.userService
    const ClientId = userService.clientId
    const ClientVersion = config.versionCode
    const SystemCode = 60
    const Authorization = userService.auth != null ? userService.auth.accessToken : null

    const defaultData: {[string]: ? string|number} = {}
    data = Object.assign(defaultData, data)

    const defaultHeader: {[string]: ? string|number} = {
      Authorization,
      ClientId,
      ClientVersion,
      'content-type': 'application/json',
      SystemCode
    }
    header = Object.assign(defaultHeader, header)

    Object.keys(data).forEach((key) => {
      if (data != null) (data[key] == null) && delete data[key]
    })
    Object.keys(header).forEach((key) => {
      if (header != null) (header[key] == null) && delete header[key]
    })
    

    if (loadingType === 'navigation') {
      console.log('显示导航栏加载')
      wxapi.showNavigationBarLoading()
    } else if (loadingType === 'none') {
      // 不使用任何加载
    } else {
      wxapi.showToast({
        title: '正在加载',
        icon: 'loading',
        duration: 10000,
        mask: true
      })
    }
    return wxapi.request({
      url: url,
      data: data,
      header: header,
      method: method
    }).then(res => {
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

      if (statusCode < 400) {
        // 2XX, 3XX 成功
        const data = result.data || null
        return data
      } else {
        // 4XX, 5XX 失败
        console.error(res)
        let err
        if (typeof result === 'object') {
          // 旧版 ymcapi 接口中只能使用 error 中的 alertMessage 来处理额外行为
          // 服务端可以处理的错误
          const error = result.error || null
          const errorMessage = error.message || error.alertMessage
          throw new Error(errorMessage) //to -> fail
        } else {
          throw new Error(result) //to -> fail
        }
      }
    }).catch(function (reason) {
      if (reason.message === "request:fail response data convert to UTF8 fail") {
        // davidfu 这里是小程序 iOS 的一个 bug， 如果返回体无法被 json 解析，就会抛出这个异常
        return
      }
      // 抛出一个全局错误
      wxapi.showToast({
        title: reason.message ? reason.message : reason,
        icon: 'loading',
        duration: 2000
      })
      console.error('catch',reason)
      throw reason //to -> fail
    }).finally(function () {
      console.log('request.. finally')
      if (loadingType === 'navigation') {
        console.log('隐藏导航栏加载')
        wxapi.hideNavigationBarLoading()
      } else if (loadingType === 'none') {
        // 不使用任何加载
      } else {
        console.log("end close loading")

        wxapi.hideToast()
      }
    })
    //.finally(function () {});
  }
}
