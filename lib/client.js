/*jslint forin: true, plusplus: true, sloppy: true, vars: true*/
//
//  clientjs.js 为用户生成clientId.
//  Version 1.0.0
//  
//  Created by pandali on 16-12-30.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

let modules = require('./modules.js');
let config = require('./config.js')
  ;(function() {
  "use strict";

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
    init () {
      const that = this;
      this.getClientId(function(clientId) {
        console.log("本次的用户的 clientId 为" + clientId)
      })
    },
    setClientId (clientId) {
      this.clientId = clientId
      try {
        wx.setStorageSync('clientId', clientId);
      } catch (e) {
        console.log('设置删除 clientId 发生错误' + e)
      }
    },
    getClientId (cb) {
      let that = this
      if (this.clientId && this.clientId.length) {
        typeof cb === 'function' && cb(this.clientId)
      } else {
        try {
          let clientId = wx.getStorageSync('clientId')
          console.log("fucking_larry" + clientId)
          if (clientId && clientId.length) {
            that.clientId = clientId
            typeof cb === 'function' && cb(this.clientId)
          } else {
            try {
              wx.removeStorageSync('clientId')
            } catch (e) {
              console.log('同步删除 clientId 发生错误' + e);
            }
            that.requestClientId(cb)
          }
        } catch (e) {
          console.log('同步获取 clientId 发生错误' + e);
        }
      }
    },
    requestClientId (cb) {
      let that = this
      const deviceId = generateUUID();
      let data = {
        deviceId: deviceId,
        userId: ''
      };
      modules.request({
        method: 'GET',
        loadingType: 'none',
        contentType: 'application/x-www-form-urlencoded',
        url: config.ucServerHTTPSUrl + 'cgi/visitor',
        data: data,
        success: function(res) {
          console.log(res)
          that.clientId = res.clientId;
          that.setClientId(that.clientId);
          typeof cb === 'function' && cb(that.clientId)
        },
        fail: function() {
          // 网络请求失败
          typeof cb === 'function' && cb(null)
        },
      })
    }
  };
  module.exports = new Clientjs();
})()
