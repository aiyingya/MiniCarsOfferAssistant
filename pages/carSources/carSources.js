let modules = require('../../lib/modules.js');
let config = require('../../lib/config.js');
Page({
	data: {
		imgAliyuncsUrl: config.imgAliyuncsUrl,
		carModelsInfo: '',
		windowHeight: '',
		showRmendCarFacade:''
	},
	onLoad (options) {
		let that = this;
		let carModelsInfo = JSON.parse(options.carModelsInfo);
		try {
      var res = wx.getSystemInfoSync();
			console.log(res)
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
		console.log(carModelsInfo)
		that.setData({
			carModelsInfo: carModelsInfo
		})
	},
	handlerAmendCarFacade(e) {
		console.log(1);
		let that = this;
		that.setData({
			showRmendCarFacade: true
		})
	}
})