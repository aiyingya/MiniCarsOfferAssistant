/**
 * 普通访客用户实体, 此时的 status 为 normal
 */
declare type NormalGuestEntity = {
  guestId: number,
  userId: string,
  createTime: string, // YYYY-mm-dd hh:MM:ss
  expireTime: string, // YYYY-mm-dd hh:MM:ss
  status: 'normal'
};

/**
 * 长期授权用户实体, 此时的  status 为 none
 */
declare type NoneGuestEntity = {
  status: 'none',
  userId: string
};

declare type GuestEntity = NormalGuestEntity | NoneGuestEntity;
