/* 配置后台服务器地址 */
let evn = 'dev';
let ucServerHTTPSUrl = function() {
	let HTTPS = {
		dev: 'https://test.yaomaiche.com/ucdev/',
		gqc: 'https://test.yaomaiche.com/ucgqc/',
		prd: ''
	}
	return HTTPS[evn];
}()

let ymcServerHTTPSUrl = function() {
	let HTTPS = {
		dev: 'https://ymcapi.yaomaiche.com/ymc',
		gqc: 'https://test.yaomaiche.com/ymcgqc/',
		prd: ''
	}
	return HTTPS[evn];
}()

/* 图片地址.*/
let imgAliyuncsUrl = function () {
	let URLS = {
		dev: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
		gqc: 'https://test.yaomaiche.com/ymcgqc/',
		prd: ''
	}
	
	return URLS[evn];
}()


module.exports = {
  ucServerHTTPSUrl: ucServerHTTPSUrl,
  ymcServerHTTPSUrl: ymcServerHTTPSUrl,
	imgAliyuncsUrl: imgAliyuncsUrl
}
