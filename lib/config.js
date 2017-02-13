/* 配置后台服务器地址 */
let evn = 'dev';
let ucServerHTTPSUrl = function() {
  let HTTPS = {
    dev: 'http://uc.private.yaomaiche.com:7070/uc/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: ''
  };
  return HTTPS[evn];
}();

let ymcServerHTTPSUrl = function() {
  let HTTPS = {
    dev: 'http://ymc.private.yaomaiche.app:7070/ymc/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: ''
  };
  return HTTPS[evn];
}();

/* 图片地址.*/
let imgAliyuncsUrl = function () {
	let URLS = {
		dev: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
		gqc: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
		prd: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops'
	};
	return URLS[evn];
}();

module.exports = {
  ucServerHTTPSUrl: ucServerHTTPSUrl,
  ymcServerHTTPSUrl: ymcServerHTTPSUrl,
	imgAliyuncsUrl: imgAliyuncsUrl
};
