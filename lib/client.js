/*jslint forin: true, plusplus: true, sloppy: true, vars: true*/
//
//  clientjs.js 为用户生成clientId.
//  Version 1.0.0
//  
//  Created by pandali on 16-12-30.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

let modules = require('./modules.js');
;(function() {
  "use strict";	
	const EVN = 'gqc';
	const config = {
		dev:'https://uc.private.yaomaiche.com:7070/uc',
		gqc:'https://uc.private.yaomaiche.com:8080/uc',
		prd:'https://uc.yaomaiche.com/uc'
	}

	function generateUUID(){
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
	};
	
	function Clientjs(options) {		
		this.init();
	}
	Clientjs.prototype = {
		clientId: '',
		init (request) {
			const that = this;
			const deviceId = generateUUID();	
			let data = {
				deviceId: deviceId,
				userId: ''
			};
			wx.getStorage({
				key: 'clientId',
				success(res) {
					console.log(res.data)
				},
				fail() {
					modules.request({
						method: 'GET',
						contentType: 'application/x-www-form-urlencoded',
						url: config[EVN]+'/visitor',
						data: data,
						success: function(res) {
							console.log(res)
							const clientId = res.clientId;
							that.setClientId(clientId);
						}
					})
				}
			})
		},
		setClientId (clientId) {
			console.log("set clientId1");
			wx.setStorage({
				key: 'clientId',
				data: clientId
			});
		}
	};	
	module.exports = new Clientjs();
})()
