// @flow
export default class Service {
  /**
   * 是否为以点数计算的特殊品牌.
   */
  static isComputePointByCarBranch(name) {
    return (name.indexOf('宝马') > -1 || name.indexOf('奥迪') > -1 || name.indexOf('MINI') > -1)
  }
}
