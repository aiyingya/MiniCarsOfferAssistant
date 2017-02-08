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
		dev: 'https://test.yaomaiche.com/ymcdev/',
		gqc: 'https://test.yaomaiche.com/ymcgqc/',
		prd: ''
	}
	return HTTPS[evn];
}()

module.exports = {
  ucServerHTTPSUrl: ucServerHTTPSUrl,
  ymcServerHTTPSUrl: ymcServerHTTPSUrl
}
