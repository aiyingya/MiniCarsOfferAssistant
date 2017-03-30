/* 配置后台服务器地址 */
const ENV = 'prd'

let ymcServerHTTPSUrl = (function () {
  let HTTPS = {
    dev: 'https://test.yaomaiche.com/ymcdev/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: 'https://ymcapi.yaomaiche.com/ymc/'
  }
  return HTTPS[ENV]
}())

module.exports = {
  ymcServerHTTPSUrl: ymcServerHTTPSUrl,
  ENV: ENV
}
