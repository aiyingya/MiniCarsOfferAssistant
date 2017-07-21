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

  authorizeForWeixin(scope: 'scope.userInfo' | ''): Promise<{ errMsg: string }> {
    if (wxapi.authorize) {
      return wxapi.authorize({ scope })
    } else {
      if (scope === 'scope.userInfo') {
        return wxapi.getUserInfo()
          .then(err => {
            return ({ errMsg: '1.0.0 使用 getUserInfo() 获取权限成功' })
          })
          .catch(err => {
            return ({ errMsg: '1.0.0 使用 getUserInfo() 获取权限失败' })
          })
      } else {
        return Promise.reject()
      }
    }
  }

  getSettingForWeixin(): Promise<{authSetting: any}> {
    if (wxapi.getSetting) {
      return wxapi.getSetting()
    } else {
      const authSetting = {}
      return Promise.resolve({ authSetting })
    }
  }

  openSettingForWeixin(): Promise<{authSetting: any}> {
    return wxapi.openSetting()
  }

}
