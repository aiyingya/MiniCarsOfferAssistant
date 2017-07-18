/**
 * user center auth entity
 *
 * accessToken : "8213e95cd952929676f777fa4367a19ad4d84751874581f14a7106b0000c26ba"
 * clientId : "5b16b13900078bc557cdac6ec4728f4c"
 * expireIn : 1499958344657
 * expireMillis : 604799993
 * refreshToken : "14a662e9eeeef933fa57297f5df3dfcefa290386864433578935df83ae680206"
 * scope : "com.yuntu.*"
 * tokenType : "bearer"
 * userId : "4117590"
 *
 * @type {
 *     accessToken: string,
 *     clientId: string,
 *     expireMillis: number,
 *     refreshToken: string,
 *     scope: string,
 *     tokenType: string,
 *     userId: string
 *   }
 * @memberof UserService
 */
declare type Auth = {
  accessToken: string,
  clientId: string,
  expireMillis: number,
  refreshToken: string,
  scope: string,
  tokenType: string,
  userId: string
}

/**
 *
 * appKey: "wxd5d5bf6b593d886e"
 * city : ""
 * country : "CN"
 * extra : "en"
 * gender : 1
 * openId : "oJNr60EADGT-ChvW0ValxcGcx29k"
 * province : "Shanghai"
 * nickname : "傅斌"
 * avatarUrl : "http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eopEuOnnoMv4l2otkB2d209UPSabmhQUzBGPXX3lic2HU3KahDicODEVskez8vzhSZ2qXjGZOibQhTeg/0"
 *
 * @type {{
 *     appKey: string,
 *     city: string,
 *     country: string,
 *     extra: string,
 *     gender: number,
 *     openId: string,
 *     province: string,
 *     nickName: string,
 *     avatarUrl: string
 *   }}
 * @memberof UserService
 */
declare type UserInfoForWeixin = {
  appKey: string,
  city: string,
  country: string,
  extra: string,
  gender: number,
  openId: string,
  province: string,
  nickName: string,
  avatarUrl: string
}

declare type UserInfoForTenant = {
  userId: string,
  mobile: string,
  tenants: Array<Tenant>
}

declare type Tenant = {
  tenantId: number,
  tenantName: string,
  tenantDescription: string,
  tenantTelephone: string,
  tenantStatus: 'online' | '',
  remark: string,
  AddressList: Array<Tenant>
}

declare type Address = {
  addressId: number,
  tenantId: number,
  provinceName: string,
  cityName: string,
  districtName: string,
  detailAddress: string
}

declare type RegisterType = 'mobile' | ''

declare type AuthInfoType = {
  userId: string,
  mobile: string,
  email: string,
  scope: string,
  registerType: RegisterType,
  active: boolean,
  hasPassword: boolean
}

declare type UseCaseType = 'register' | 'access' | 'registerOrAccess' | 'resetPassword'

declare type AuthType = 'code' | 'password'

declare type AuthEntity = Passport | VCode

declare type VCodeType = 'SMS' | 'Voice'

declare type Passport = {
  loginName: string,
  password: string
}

declare type VCode = {
  mobile: string,
  code: string,
  useCase: UseCaseType
}

declare type TokenType = 'bearer' | 'mac'

declare type ExtraType = 'access' | 'setPassword' | 'bound' | 'unbound'

declare type LoginChannelType = 'guest' | 'weixin' | 'yuntu'

declare type SNSIdType = string | number
