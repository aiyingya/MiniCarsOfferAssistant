/* 配置后台服务器地址 */
let evn = 'dev'

let ucServerHTTPSUrl = (function () {
  let HTTPS = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://uc.yaomaiche.com/uc/'
  }
  return HTTPS[evn]
}())

let ymcServerHTTPSUrl = (function () {
  let HTTPS = {
    dev: 'https://test.yaomaiche.com/ymcdev/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: 'https://ymcapi.yaomaiche.com/ymc/'
  }
  return HTTPS[evn]
}())

let tradeServerHTTPSUrl = (function () {
  let HTTPS = {
    dev: 'https://test.yaomaiche.com/tradedev/',
    gqc: 'https://test.yaomaiche.com/tradegqc/',
    prd: 'https://ymcapi.yaomaiche.com/ymc/'
  }
  return HTTPS[evn]
}())

let imgAliyuncsUrl = (function () {
  let URLS = {
    dev: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
    gqc: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
    prd: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops'
  }
  return URLS[evn]
}())

module.exports = {
  ucServerHTTPSUrl: ucServerHTTPSUrl,
  ymcServerHTTPSUrl: ymcServerHTTPSUrl,
  imgAliyuncsUrl: imgAliyuncsUrl,
  tradeServerHTTPSUrl: tradeServerHTTPSUrl
}
