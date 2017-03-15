let app = getApp()
Page({
	data: {
		userInfo: '',
		weixinPortrait: '../../images/icons/icon_head_default_44.png'
	},
	onLoad() {
		let userinfo = app.userInfo()

    this.$wuxToast = app.wux(this).$wuxToast
	},
	onShow() {
    /**
     * fucking larry 跳转流程
     * @type {*}
     */
    let quotation = app.fuckingLarryNavigatorTo.quotation
    let source = app.fuckingLarryNavigatorTo.source

    if (quotation && typeof quotation === 'object') {
      wx.navigateTo({
        url: '/pages/quote/quotationsList/quotationsList',
        success: function (res) {
        },
        fail: function () {
        },
        complete: function () {
        }
      })
    }

		let userinfo = app.userInfo()
		let that = this
		let weixinUsersInfo = app.globalData.userInfo
		if(userinfo) {
			const _HTTPS = `${app.config.ucServerHTTPSUrl}cgi/tenant/member/${userinfo.userId}/tenant`			
			app.modules.request({
				url: _HTTPS, 
				method: 'GET',
				loadingType: 'none',
				data: {},
				header: {
					Authorization: userinfo.accessToken
				},
				success (res) {
					let location = []
          console.log(weixinUsersInfo)
					userinfo.mobile = res.mobile
					userinfo.weixinName = weixinUsersInfo.weixinName || res.name
					userinfo.weixinPortrait = weixinUsersInfo.weixinPortrait
					userinfo.tenants = res.tenants
					
					if(res.tenants) {
						for(let item of res.tenants) {
							if(item.address) {							
								location.push(item.address)
							}
						}
					}
				
					if(location) {
						app.globalData.location = location
						app.globalData.mobile = res.mobile
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