// @flow
import Service from './base.service'

export default class UserService extends Service {
  baseUrl = {
    dev: 'https://test.yaomaiche.com/ubtdev/',
    gqc: 'https://test.yaomaiche.com/ubtgqc/',
    prd: 'https://ubt.yaomaiche.com/'
  };

  /**
   * 上报 ubt 信息, 这个接口会返回一个容量极小的 gif 图片
   * 原因是这个接口原本是在 h5 中通过 <img> 标签的 src 的属性调用的
   *
   * @param {PageEvent} data
   * @returns {Promise<void>}
   * @memberof UserService
   */
  createReport(data: PageEvent): Promise<void> {
    return this.request(
      'acquire/report',
      'GET',
      data
    )
  }
}
