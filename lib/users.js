/*jslint forin: true, plusplus: true, sloppy: true, vars: true*/
//
//  users.js 用户登录注册.
//  Version 1.0.0
//  
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//
import config from 'config'
import modules from 'modules'

class users {
	constructor() {
  }
	
	__sendMessage(opts) {
		const _HTTPS = `${config.ucServerHTTPSUrl}${opts.path}`
		modules.request({
			url: _HTTPS, 
			method: opts.method,
			header: opts.header,
			data: opts.data,
			success: opts.success,
			fail: opts.fail
		})
	}
	
	// 获取时间戳.
	__getTimestamp (ms) {
		let currentDate = new Date()
		let currentTime = currentDate.getTime()
		let expirationTime = currentTime + ms
	
		return expirationTime;
	}
	/** 
	 * 获取验证码.
	 */
	
	getSMSCode(opts) {
		if(!opts) return
		
		console.log('get SMS code')
		this.__sendMessage({
			path: 'cgi/vcode',
			method: 'POST',
			data:{
				"type": "SMS",
				"mobile": opts.mobile,
				"useCase": 'access' ,// register(注册)/access(登录)/registerOrAccess(注册或登录)/resetPassword(忘记密码)
				"strictlyCheck": true // 是否校验手机号，如果校验，则注册时用户已存在会抛出异常；登录/修改密码时，用户不存在会抛出异常"
			},
			success: opts.success,
			fail: opts.fail
		});
	}
	
	/**
	 * 用户登录
	 */
	
	login(opts) {
		if(!opts) return
		console.log('password login')
		let that = this
		this.__sendMessage({
			path: 'cgi/authorization',
			method: 'POST',
			data:{
				"type": "code",
				"vcode":{
					"mobile": opts.mobile,
					"code": opts.code,
					"useCase": 'access' //"使用场景，枚举：access(注册、登录)/resetPassword(忘记密码)"
				}
			},
			success: function(res) {
				if(res){
					let expireIn = that.__getTimestamp(res.expireMillis)
					res.expireIn = expireIn
					let userInfo = JSON.stringify(res)
					try {
							wx.setStorageSync('userInfo', userInfo)
							opts.success(res)
					} catch (e) {  

					}
				}
			},
			fail: opts.fail
		})
	}
	
	/**
	 * 判断用户是否是租户成员
	 */
	
	exsitTenanTmember(opts) {
		if(!opts) return
		console.log('exsit tenant tmeber')
		this.__sendMessage({
			path: 'cgi/tenant/member/exist',
			method: 'GET',
			data:{
				"mobile": opts.mobile,
			},
			success: opts.success,
			fail: opts.fail
		})
	}
	
	/**
	 * 刷新用户信息.
	 */
	newAccessToken (opts) {
		console.log('get new accessToken')
		let that = this
		this.__sendMessage({
			method: 'PUT',
			path: 'cgi/authorization',
			header: {
				Authorization: opts.refreshToken
			},
			data:{},
			success: function(res) {
				if(res) {
					let expireIn = that.__getTimestamp(res.expireMillis)
					res.expireIn = expireIn
					let userInfo = JSON.stringify(res)
					try {
						wx.setStorageSync('userInfo', userInfo)
						opts.success(res)
					} catch (e) {  

					}
				}
			},
			fail: function(err) {
        try {
          wx.removeStorageSync('userInfo');
          opts.fail(err)
        } catch (e) {
          // ..
        }
			}
		});	
	};
}

export default users