/**
 * 普通访客用户实体
 */
declare type GuestEntity = {
  /**
   * 访客标志
   *
   * @type {number}
   */
  guestId?: number,

  /**
   * 试用期创建/开始时间
   * YYYY-mm-dd hh:MM:ss
   *
   * @type {string}
   */
  createTime?: string,

  /**
   * 试用期过期时间
   * YYYY-mm-dd hh:MM:ss
   *
   * @type {string}
   */
  expireTime?: string,

  /**
   * 用户标示
   *
   * @type {string}
   */
  userId: string,

  /**
   * 访客有三种状态
   * normal 代表属于无登录权限的访客, 会拥有试用期
   * none 代表费访客, 也就是正常用户
   * expire 代表当前访客过期
   *
   * @type {('normal' | 'none' | 'expire')}
   */
  status: 'normal' | 'none' | 'expire'
};
