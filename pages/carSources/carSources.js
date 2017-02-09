let modules = require('../../lib/modules.js');
let config = require('../../lib/config.js');
Page({
	data: {
		imgAliyuncsUrl: config.imgAliyuncsUrl,
		carModelsInfo: ''
	},
	onLoad (options) {
		let that = this;
		let carModelsInfo = JSON.parse(options.carModelsInfo);
		console.log(carModelsInfo)
		that.setData({
			carModelsInfo: carModelsInfo
		})
	}
	
})