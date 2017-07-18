// @flow
import { env, versionCode, container, request } from '../index'

export default class Service {

  baseUrl: { ['dev' | 'gqc' | 'prd']: string }

  responsePackFormat: ResponsePackFormat

  constructor() {
    this.responsePackFormat = 'new'
  }

  request(
    path: string,
    method: RequestMethod,
    data: ?{ [string]: any } = null,
    header?: ?{ [string]: string } = null,
  ): Promise<any> {

    const ClientId = container.userService.clientId
    const ClientVersion = versionCode
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

    Object.keys(finalData).forEach((key) => (finalData[key] == null) && delete finalData[key]);
    Object.keys(finalHeader).forEach((key) => (finalHeader[key] == null) && delete finalHeader[key]);

    const url = `${this.baseUrl[env]}${path}`
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

        if (wx_statusCode < 400) {
          // 2XX, 3XX 成功
          const data = wx_data.data
          return data
        } else {
          // 4XX, 5XX 失败
          const error = wx_data.error
          if (error != null) {
            const errorMessage = error.message
            console.error(error.debugInfo)
            throw new Error(errorMessage) //to -> fail
          } else {
            throw new Error('404 or other error')
          }
        }
      }, err => {
        if (err.message === "request:fail response data convert to UTF8 fail") {
          // davidfu 这里是小程序 iOS 的一个 bug， 如果返回体无法被 json 解析，就会抛出这个异常
          return
        }

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
          // 4XX, 5XX 失败
          let err
          const error = wx_data.error
          if (error != null) {
            const errorMessage = error.alertMessage
            throw new Error(errorMessage) //to -> fail
          } else {
            throw new Error('404 or other error')
          }
        }
      }, err => {
        if (err.message === "request:fail response data convert to UTF8 fail") {
          // davidfu 这里是小程序 iOS 的一个 bug， 如果返回体无法被 json 解析，就会抛出这个异常
          return
        }
      })
  }

  unpackResponseInLegacyFormat(
    promise: Promise<any>
  ): Promise<any> {
    return new Promise((resolve, reject) => { })
  }

  setup(): void {
  }
}
