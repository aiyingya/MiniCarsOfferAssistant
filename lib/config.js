/*配置后台服务器地址.*/
function serverHTTPSUrl(evn) {
	var HTTPS = {
		dev: 'https://api.yaomaiche.com/ucdev',
		gqc: '',
		prd: '',
		ymcapi: 'https://ymcapi.yaomaiche.com/ymc',
		imageDomain: "http://produce.oss-cn-hangzhou.aliyuncs.com/ops"
	}
	return HTTPS[evn];
}

module.exports = {
  serverHTTPSUrl: serverHTTPSUrl
}