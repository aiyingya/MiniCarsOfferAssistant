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

  checkSessionForWeixin(): Promise<void> {
    return wxapi.checkSession()
  }

  loginForWeixin(): Promise<{code: string, errMsg: string}> {
    return wxapi.login()
  }

  getUserInfoForWeixin(withCredentials: boolean): Promise<UserInfoFromMiniProgram> {
    return wxapi.getUserInfo({ withCredentials })
  }

  authorizeForWeixin(scope: 'scope.userInfo'|''): Promise<{ errMsg: string}> {
    return wxapi.authorize({ scope })
  }

  getSettingForWeixin(): Promise<{authSetting: any}> {
    return wxapi.getSetting()
  }

  openSettingForWeixin(): Promise<{authSetting: any}> {
    return wxapi.openSetting()
  }

}
