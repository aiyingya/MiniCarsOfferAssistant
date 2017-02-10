// wx 封装.

/** 
 * wx.request.
 * request.js 
 */
function xmlHTTPRquest(options) {
	if(!options) return;
	try {
		let clientId = wx.getStorageSync('clientId')
		let header = {
			'ClientId': clientId,
			'ClientVersion': '10000',
			'SystemCode': '60',
			'content-type': options.contentType || 'application/json'
		}
		if(options.header){
				for (let key of options.header) { 
				header[key] = options.header[key]; 
			}
		}
		wx.request({
			url: options.url,
			method: options.method,
			data: options.data,
			header: header,
			success: options.success
		})
	} catch (e) {
		
	}
}

module.exports = {
  request: xmlHTTPRquest
}