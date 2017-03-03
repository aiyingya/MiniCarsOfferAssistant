let app = getApp()
Page({
	data: {
		userInfo: '',
		weixinPortrait: '../../images/icons/icon_head_default_44.png'
	},
	onLoad() {
		let userinfo = app.userInfo()

    this.$wuxToast = app.wux(this).$wuxToast
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
				loadingType: 'none',
				data: {
					uid: userinfo.userId
				},
				header: {
					Authorization: userinfo.accessToken
				},
				success (res) {
					let location = []
					userinfo.mobile = res.mobile
					userinfo.weixinName = weixinUsersInfo.weixinName || res.name
					userinfo.weixinPortrait = weixinUsersInfo.weixinPortrait
					userinfo.tenants = res.tenants
					
					if(res.tenants) {
						for(let item of res.tenants) {
							if(item.addressList.length > 0) {
								for(let aitem of item.addressList) {
									location.push(aitem.location)
								}
							}
						}
					}
				
					if(location) {
						app.globalData.location = location
					}	
					that.setData({
						userInfo: userinfo,
						weixinPortrait: weixinUsersInfo.weixinPortrait
					})
				},
				fail(err) {
					that.$wuxToast.show({
						type: false,
						timer: 2000,
						color: '#fff',
						text: '服务器错误',
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
		let userInfo = this.data.userInfo
		if(!userInfo) {
			return
		}
		
		wx.navigateTo({
			url: '../quote/quotationsList/quotationsList'
		})
	},
	handleToSupplier() {
		let userInfo = this.data.userInfo
		if(!userInfo) {
			return
		}
		
		wx.navigateTo({
			url: '../supplier/supplier'
		})
	}
	
})