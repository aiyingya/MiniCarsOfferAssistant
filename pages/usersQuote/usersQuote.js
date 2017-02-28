let app = getApp()
Page({
	data: {
		userInfo: '',
		weixinPortrait: '../../images/icons/icon_head_default_44.png'
	},
	onLoad() {
		let userinfo = app.userInfo()
		
		console.log(userinfo)
	},
	onShow() {
		let userinfo = app.userInfo()
		let that = this
		let weixinUsersInfo = app.globalData.userInfo
		if(userinfo) {
			const _HTTPS = `${app.config.ucServerHTTPSUrl}cgi/tenant/member/tenant`			
			app.modules.request({
				url: _HTTPS, 
				method: 'GET',
				data: {
					uid: userinfo.userId
				},
				header: {
					Authorization: userinfo.accessToken
				},
				success (res) {
					userinfo.mobile = res.mobile
					userinfo.weixinName = weixinUsersInfo.weixinName
					userinfo.weixinPortrait = weixinUsersInfo.weixinPortrait
					userinfo.tenants = res.tenants
					that.setData({
						userInfo: userinfo,
						weixinPortrait: weixinUsersInfo.weixinPortrait
					})
				}
			})
		}
	},
	handleToLogin() {
		wx.navigateTo({
			url: '../login/login'
		})
	},
	handleUserLogout() {
		let that = this
		try {
			wx.removeStorageSync('userInfo')
			that.setData({
				userInfo: '',
				weixinPortrait: '../../images/icons/icon_head_default_44.png'
			})
		} catch (e) {
			// Do something when catch error
		}
	},
	handleToQuoteRecord() {
		let userInfo = app.userInfo()
		if(!userInfo) {
			return
		}
		
		wx.navigateTo({
			url: '../quote/quotationsList/quotationsList'
		})
	},
	handleToSupplier() {
		let userInfo = app.userInfo()
		if(!userInfo) {
			return
		}
		
		wx.navigateTo({
			url: '../supplier/supplier'
		})
	}
	
})