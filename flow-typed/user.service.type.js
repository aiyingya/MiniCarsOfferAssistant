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

declare type RoleInfoForGuest = {
  roleInfo: {
    guestId: number,
    createTime: string,
    expireTime: string,
    mobile: string,
    userId: string,
    status: 'normal' | 'expire'
  },
  roleName: 'guest'
};

declare type RoleInfoForEmployee = {
  roleInfo: UserInfoForTenant,
  roleName: 'employee'
};

declare type UserInfoForTenant = {
  userId: string,
  mobile: string,
  name: string,
  tenants: Array<Tenant>
}

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

declare type RoleEntity = RoleInfoForEmployee | RoleInfoForGuest;
