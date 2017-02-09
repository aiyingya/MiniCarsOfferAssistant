/* 配置后台服务器地址 */
let evn = 'dev';
let ucServerHTTPSUrl = function() {
  let HTTPS = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: ''
  };
  return HTTPS[evn];
}();

let ymcServerHTTPSUrl = function() {
  let HTTPS = {
    dev: 'https://test.yaomaiche.com/ymcdev/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: ''
  };
  return HTTPS[evn];
}();

/* 图片地址.*/
let imgAliyuncsUrl = function () {
	let URLS = {
		dev: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
		gqc: 'https://test.yaomaiche.com/ymcgqc/',
		prd: ''
	};
	return URLS[evn];
}();

let request = function(object) {
  let header = {
    Authorization: '需要替换为相应的 token',
    ClientId: '需要替换为用户的 userId',
    ClientVersion: 10000,
    SystemCode: '需要替换为微信数据',
  };

  // 合并头参数
  for (var attrname in object.header) { header[attrname] = object.header[attrname]; }

  wx.request({
    url: object.url,
    data: object.data,
    method: object.method,
    header: header,
    success: function(res) {
      if (res.behavior) {
        // 首先判断 app 额外行为
      }

      if (res.error) {
        // 返回体中有错误返回
        object.fail(res.error);
      } else if (res.data) {
        // 返回体中有数据返回
        object.success(res.data);
      } else {
        console.log('返回体中既没有 error， 也没有 data， 与约定不符合');
      }

      object.success(data);
    },
    fail: function() {
      object.fail();
    },
    complete: function() {
      object.complete();
    }
  });
};

module.exports = {
  ucServerHTTPSUrl: ucServerHTTPSUrl,
  ymcServerHTTPSUrl: ymcServerHTTPSUrl,
	imgAliyuncsUrl: imgAliyuncsUrl,
  request: request
};
