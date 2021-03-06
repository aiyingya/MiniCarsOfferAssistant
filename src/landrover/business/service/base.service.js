// @flow
import { config, container, request, ui } from '../index'

export default class Service {
  baseUrl: { ['dev' | 'gqc' | 'prd']: string }

  responsePackFormat: ResponsePackFormat

  constructor() {
    this.responsePackFormat = 'new'
  }

  setup(): Promise<void> {
    return Promise.resolve()
  }

  url(path: string): string {
    return `${this.baseUrl[config.env]}${path}`
  }

  request(
    path: string,
    method: RequestMethod,
    data: ?{ [string]: any } = null,
    header?: ?{ [string]: string } = null,
  ): Promise<any> {
    const ClientId = container.userService.clientId
    const ClientVersion = config.versionCode
    const SystemCode = 60
    const Authorization = container.userService.auth != null ? container.userService.auth.accessToken : null

    const defaultHeader = {
      Authorization,
      ClientId,
      ClientVersion,
      SystemCode
    }
    const finalData = Object.assign({}, data)
    const finalHeader = Object.assign(defaultHeader, header)

    Object.keys(finalData).forEach((key) => (finalData[key] == null) && delete finalData[key])
    Object.keys(finalHeader).forEach((key) => (finalHeader[key] == null) && delete finalHeader[key])

    const url = this.url(path)
    const promise = request.request(
      url,
      method,
      finalData,
      finalHeader,
    )
    if (this.responsePackFormat === 'new') {
      return this.unpackResponse(promise)
    } else if (this.responsePackFormat === 'old') {
      return this.unpackResponseInOldFormat(promise)
    } else {
      return this.unpackResponseInLegacyFormat(promise)
    }
  }

  unpackResponse(
    promise: Promise<any>
  ): Promise<any> {
    return promise
      .then(res => {
        const wx_data: ResponsePackage = res.data
        const wx_statusCode = res.statusCode
        const wx_header = res.header
        const wx_errMsg = res.errMsg

        // 新版 uc 接口使用 behavior 来处理额外行为，
        const behavior = wx_data.behavior || null
        if (behavior != null) {
          if (behavior.type === 'TOAST') {
            const content = behavior.content
            if (content && content.length) {
              ui.showToast(content)
            }
          } else if (behavior.type === 'Alert') {
            // 暂不实现
          } else if (behavior.type === 'Notice') {
            // 暂不实现
          }
        }

        if (wx_statusCode < 400) {
          // 2XX, 3XX 成功

          // 目前有种情况就是 状态码 返回为 200 的时候, 服务端还是会返回出错
          const error = wx_data.error
          if (error != null) {
            // 如果 error 字段有不为空
            const errorMessage = error.message
            console.error(error.debugInfo)
            return Promise.reject(new Error(errorMessage))
          } else {
            // 如果 error 字段为空
            const data = wx_data.data
            return data
          }
        } else {
          if (wx_statusCode === 401) {
            // 接口无权限
            container.userService.clearUserInfo()
          }

          // 4XX, 5XX 失败
          const error = wx_data.error
          if (error != null) {
            const errorMessage = error.message
            console.error(error.debugInfo)
            return Promise.reject(new Error(errorMessage))
          } else {
            return Promise.reject(new Error('404 or other error'))
          }
        }
      })
      .catch(err => {
        if (err.message === 'request:fail response data convert to UTF8 fail') {
          // davidfu 这里是小程序 iOS 的一个 bug， 如果返回体无法被 json 解析，就会抛出这个异常
          return
        }
        return Promise.reject(err)
      })
  }

  unpackResponseInOldFormat(
    promise: Promise<any>
  ): Promise<any> {
    return promise
      .then(res => {
        const wx_data: ResponseOldPackage = res.data
        const wx_statusCode = res.statusCode
        const wx_header = res.header
        const wx_errMsg = res.errMsg

        if (wx_statusCode < 400) {
          // 2XX, 3XX 成功
          const data = wx_data.data || null
          return data
        } else {
          if (wx_statusCode === 401) {
            // 接口无权限
            container.userService.clearUserInfo()
          }

          // 4XX, 5XX 失败
          const error = wx_data.error
          if (error != null) {
            const errorMessage = error.alertMessage
            ui.showToast(errorMessage)
            return Promise.reject(new Error(errorMessage)) // to -> fail
          } else {
            return Promise.reject(new Error('404 or other error'))
          }
        }
      })
      .catch(err => {
        if (err.message === 'request:fail response data convert to UTF8 fail') {
          // davidfu 这里是小程序 iOS 的一个 bug， 如果返回体无法被 json 解析，就会抛出这个异常
          return
        }
        return Promise.reject(err)
      })
  }

  unpackResponseInLegacyFormat(
    promise: Promise<any>
  ): Promise<any> {
    return new Promise((resolve, reject) => { })
  }
}
