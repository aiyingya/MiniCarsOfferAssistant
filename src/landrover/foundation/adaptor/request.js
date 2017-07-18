// @flow
import * as wxapi from 'fmt-wxapp-promise'

export default class Request implements RequestVirtualClass {
  request(url: string, method: RequestMethod, data: {[string]: any}, header: {[string]: string},): Promise<any> {
    return wxapi.request({
      url: url,
      method: method,
      data: data,
      header: header
    })
  }
}
