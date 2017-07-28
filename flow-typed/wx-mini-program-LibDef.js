declare function getApp(): any;
declare module "fmt-wxapp-promise" {
  declare module.exports: any;
};
declare var wx: any;

declare type UserInfoPlainFromMiniProgram = {
  nickName: string,
  avatarUrl: string,
  gender: 0 | 1 | 2,
  city: string,
  province: string,
  country: string,
};

declare type UserInfoEncryptedFromMiniProgram = {
  openId: string,
  unionId: string,
  nickName: string,
  avatarUrl: string,
  gender: 0 | 1 | 2,
  city: string,
  province: string,
  country: string,
  watermark: {
    appId: string,
    timestamp: number
  }
};

declare type UserInfoFromMiniProgram = UserInfoPlainFromMiniProgram | UserInfoEncryptedFromMiniProgram;
