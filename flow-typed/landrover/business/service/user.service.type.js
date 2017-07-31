declare type Scope = 'com.yuntu.*' | 'com.yuntu.uc.passport.resetPassword';

declare type Auth = {
  accessToken: string,
  clientId: string,
  expireIn: number,
  expireMillis: number,
  refreshToken: string,
  scope: Scope,
  tokenType: string,
  userId: string
};

declare type UserInfo = {
  userId: string,
  userName: string,
  mobile: string,
  email: string,
  name: string,
  gender: '男' | '女',
  birthday: string,
  headPortrait: string,
  nickName: string,
  idCard: string
};

declare type UserInfoForWeixin = {
  customerId: number,
  userId: string,
  weixinName: string,
  portrait: string,
  sex: number,
  country: string,
  province: string,
  city: string
};

declare type Weixin = {
  userInfo: UserInfoForWeixin,
  sessionId: string
};

declare type UserInfoForTenant = {
  userId: string,
  mobile: string,
  name: string,
  tenants: Array<Tenant>
};

declare type Tenant = {
  tenantId: number,
  tenantName: string,
  tenantDescription: string,
  tenantTelephone: string,
  tenantStatus: 'online' | '',
  remark: string,
  address: Address
};

declare type Address = {
  addressId: number,
  cityId: number,
  cityName: string,
  detailAddress: string,
  districtId: number,
  districtName: string,
  lat: number,
  lon: number,
  provinceId: number,
  provinceName: string,
  tenantId: number
};

declare type RegisterType = 'mobile' | '';

declare type AuthInfoType = {
  userId: string,
  mobile: string,
  email: string,
  scope: Scope,
  registerType: RegisterType,
  active: boolean,
  hasPassword: boolean
};

declare type UseCaseType = 'register' | 'access' | 'registerOrAccess' | 'resetPassword';

declare type AuthType = 'code' | 'password';

declare type AuthEntity = Passport | VCode;

declare type VCodeType = 'SMS' | 'Voice';

declare type Passport = {
  loginName: string,
  password: string
};

declare type VCode = {
  mobile: string,
  code: string,
  useCase: UseCaseType
};

declare type TokenType = 'bearer' | 'mac';

declare type ExtraType = 'access' | 'setPassword' | 'bound' | 'unbound';

declare type LoginChannelType = 'guest' | 'weixin' | 'yuntu';

declare type SNSIdType = string | number;

declare type UserInfoPlainEntityForWeixin = {
  userInfo: UserInfoForWeixin,
  rawData: string,
  signature: string
};

declare type UserInfoEncryptedEntityForWeixin = {
  encryptedData: string,
  iv: string
};

declare type UserInfoEntityForWeixin = UserInfoPlainEntityForWeixin | UserInfoEncryptedEntityForWeixin;

declare type ScopeForWeixin = 'scope.userInfo' | 'scope.userLocation' | 'scope.address' | 'scope.record' | 'scope.writePhotosAlbum';
