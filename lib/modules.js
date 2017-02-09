// wx 封装.

/** 
 * wx.request.
 * request.js 
 */
function xmlHTTPRquest(options) {
	if(!options) return;
	
	let clientId = wx.getStorage('clientId');
	wx.request({
		url: options.url,
		method: options.method,
		data: options.data,
		header: {
			'content-type': 'application/json',
			'cliendId': clientId
		},
		success: options.success
	})
}

module.exports = {
  request: xmlHTTPRquest
}