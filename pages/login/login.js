import users from '../../lib/users'
let app = getApp()
Page({
	data: {
		userPhoneValue: '',
		userCodeValue: '',
		codeText: '获取验证码',
		countDownOver: true,
		countDownClass: '',
		notUserInYMC: false
	},
	onLoad() {
		this.users = new users
		this.$wuxToast = app.wux(this).$wuxToast
	},
	handleLoginPhone(e) {
		let val = e.detail.value
		
		this.data.userPhoneValue = val
		
	},
	handleSMSCode(e) {
		let val = e.detail.value
		
		this.data.userCodeValue = val
	},
	handleGetSMSCode() {
		let that = this
		
		if(!that.data.countDownOver) return
		
		if(!this.data.userPhoneValue) {
			that.$wuxToast.show({
				type: false,
        timer: 2000,
        color: '#fff',
        text: '手机号输入不正确',
			})
			return
		}
		that.users.exsitTenanTmember({
			mobile: that.data.userPhoneValue,
			success(res) {
				if(res) {
					console.log(res)
					that.users.getSMSCode({
						mobile: that.data.userPhoneValue,
						success(res) {
							that.countDown()
							that.setData({
								notUserInYMC: false
							})
						}
					})
				}else {
					that.setData({
						notUserInYMC: true
					})
				}
			}
		})
	},
	countDown() {
		let time = 30
		let that = this
		let t = setInterval(function() {
			if(time > 0) {
				time--
				let STR = `已发送(${time}s)`
				that.setData({
					codeText: STR,
					countDownOver: false,
					countDownClass: 'count-down'
				})
			}else {
				clearInterval(t)
				that.setData({
					codeText: '重新获取',
					countDownOver: true,
					countDownClass: ''
				})
			}
		},1000)	
	},
	userLogin() {
		let that = this
		if(!that.data.userPhoneValue) {
			that.$wuxToast.show({
				type: false,
        timer: 2000,
        color: '#fff',
        text: '手机号输入不正确',
			})
			return
		}
		
		if(!that.data.userCodeValue) {
			that.$wuxToast.show({
				type: false,
        timer: 2000,
        color: '#fff',
        text: '验证码输入不正确',
			})
			return
		}

		that.users.login({
			mobile: that.data.userPhoneValue,
			code: that.data.userCodeValue,
			success(res) {
				if(res){
					wx.navigateBack()
				}
			}
		})
	}
	
})