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

declare type AuthEntity = AuthPassport | AuthVCode;

declare type VCodeType = 'SMS' | 'Voice';

declare type AuthPassport = {
  type: 'password',
  passport: {
    loginName: string,
    password: string
  }
};

declare type AuthVCode = {
  type: 'code',
  vcode: {
    mobile: string,
    code: string,
    useCase: UseCaseType
  }
};

declare type TokenType = 'bearer' | 'mac';

declare type ExtraType = 'access' | 'setPassword' | 'bound' | 'unbound';

declare type LoginChannelType = 'guest' | 'weixin' | 'yuntu';

declare type SNSIdType = string | number;

declare type ScopeForWeixin = 'scope.userInfo' | 'scope.userLocation' | 'scope.address' | 'scope.record' | 'scope.writePhotosAlbum';
