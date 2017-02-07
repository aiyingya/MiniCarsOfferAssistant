/*配置后台服务器地址.*/
function serverHTTPSUrl(evn) {
	var HTTPS = {
		dev: 'https://api.yaomaiche.com/ucdev',
		gqc: '',
		prd: ''
	}
	return HTTPS[evn];
}

module.exports = {
  serverHTTPSUrl: serverHTTPSUrl
}