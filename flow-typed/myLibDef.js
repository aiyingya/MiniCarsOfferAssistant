/**
 * 普通访客用户实体
 */
declare type RoleInfoForGuest = {
  /**
   * 访客标志
   *
   * @type {number}
   */
  guestId: number,

  /**
   * 试用期创建/开始时间
   * YYYY-mm-dd hh:MM:ss
   *
   * @type {string}
   */
  createTime: string,

  /**
   * 试用期过期时间
   * YYYY-mm-dd hh:MM:ss
   *
   * @type {string}
   */
  expireTime: string,

  /**
   * 访客电话号码
   *
   * @type {string}
   */
  mobile: string,

  /**
   * 用户标示
   *
   * @type {string}
   */
  userId: string,

  /**
   * 访客有三种状态
   * normal 代表属于无登录权限的访客, 会拥有试用期
   * expire 代表当前访客过期
   *
   * @type {('normal' | 'expire')}
   */
  status: 'normal' | 'expire'
};

declare type RoleEntity = {

  /**
   * 角色信息
   * 当 roleName === 'guest' 时, 角色信息实体为 RoleInfoForGuest
   * 当 roleName === 'employee' 时, 角色信息实体为 RoleInfoForEmployee
   *
   * @type {(GuestEntity | RoleInfoForEmployee)}
   */
  roleInfo: RoleInfoForGuest | RoleInfoForEmployee,

  /**
   * 角色名称, 分为 访客 guest, 雇员 employee
   *
   * 1.9.0 中 访客为普通登录用户, 其享有10有效期, 十天过后无法登陆
   *
   * @type {('guest' | 'employee')}
   */
  roleName: 'guest' | 'employee'
};

declare type ChartDataItem = {
  data: Array<string | number | null>,
  color: string | null,
  name: string | null,
  topno?: number | null,
  switch?: boolean,
  companyCount?: Array<number | null>,
  days: number | null
}
