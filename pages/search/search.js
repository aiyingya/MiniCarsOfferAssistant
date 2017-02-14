/* search.js*/
let app = getApp();
Page({
	data: {
		searchResults: [],
		newSearchResults: [
			{val:'1'},
			{val:'12'},
			{val:'123'},
			{val:'1234'},
			{val:'12345'}
		],
		data:[{"carModelId":"C5997556-CAB7-47F8-A2E6-21026C2EF082","carModelName":"宝马1系 2015款 120i 运动设计套装 欧V（符合国V标准）","officialPrice":306000.00,"officialPriceStr":"30.60","lowestPriceSku":{"skuId":"023010CE-65CC-47B6-A7A2-A59A00BEDC79","skuPic":"/upload/image/original/201512/021043356647.jpg","externalColorId":"C869C59C-E619-47FB-8A7C-F5BB24932F6E","externalColorName":"绯红色","internalColorId":"1B2AA0C6-F698-4CBC-89A5-B51F3498E28F","internalColorName":"黑色","price":232560.00,"priceStr":"23.26","discount":73440.00,"status":"no_stock","remark":"无"}},{"carModelId":"13CC855E-F110-4256-B527-5841FE60FE90","carModelName":"宝马1系 2015款 118i 领先型 欧IV（符合国IV标准）","officialPrice":256000.00,"officialPriceStr":"25.60","lowestPriceSku":{"skuId":"06E42496-CC9E-4470-AAA5-A5CA0146E212","skuPic":"/upload/image/original/20160229/47987b72-c1a3-4a52-bce2-a747f438158a.jpg","externalColorId":"47987B72-C1A3-4A52-BCE2-A747F438158A","externalColorName":"黑色","internalColorId":"8E72D87E-45EE-40CA-AF90-070E9CCDE922","internalColorName":"黑色/珍珠贝白色","price":256000.00,"priceStr":"25.60","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"379D1147-69F6-4914-B9FA-8F1A1B1ED20A","carModelName":"宝马1系 2015款 M135i 欧V（符合国V标准）","officialPrice":496000.00,"officialPriceStr":"49.60","lowestPriceSku":{"skuId":"0B96C83A-8D46-44F4-9095-A59C00B081C4","skuPic":"/upload/image/original/201512/021053549835.jpg","externalColorId":"19BFD07B-A0F5-4897-AF5D-0BCB04019C4E","externalColorName":"矿石灰","internalColorId":"2AD61DB3-5589-4C27-9433-BC8002A658D5","internalColorName":"黑色/珍珠贝白色","price":496000.00,"priceStr":"49.60","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"9BC42762-37EE-4A54-B248-A59801279044","carModelName":"宝马1系 2016款 118i 领先型 国V","officialPrice":256000.00,"officialPriceStr":"25.60","lowestPriceSku":{"skuId":"0AA2B68B-ADFF-49C7-A9EF-A59F015116ED","skuPic":"/upload/image/original/批量上传/宝马1系/巴伦西亚橙.jpg","externalColorId":"0F84BEA6-7D76-4E0F-A1E0-A5980127904B","externalColorName":"巴伦西亚橙","internalColorId":"42DAB044-CC60-4B85-8BE9-A59900A484F7","internalColorName":"黑色/珍珠贝白色","price":194560.00,"priceStr":"19.46","discount":61440.00,"status":"no_stock","remark":"无"}},{"carModelId":"319D63A8-AB33-4683-9C76-37772D863C23","carModelName":"宝马1系 2015款 120i 领先型 欧V（符合国V标准）","officialPrice":292000.00,"officialPriceStr":"29.20","lowestPriceSku":{"skuId":"22265B86-85E9-4696-83D4-A59C00A62755","skuPic":"/upload/image/original/201512/021058455666.jpg","externalColorId":"4151C028-8260-44FB-87EF-E76AB7ABB5F1","externalColorName":"矿石白","internalColorId":"8C3B1C22-C1B8-4712-9F08-C67D3111EC87","internalColorName":"黑色","price":221920.00,"priceStr":"22.19","discount":70080.00,"status":"in_stock","remark":"无"}},{"carModelId":"4C4A25EC-7EE6-4B72-86FE-A5E4854E753C","carModelName":"宝马1系 2015款 120i 领先型 欧IV（符合国IV标准）","officialPrice":292000.00,"officialPriceStr":"29.20","lowestPriceSku":{"skuId":"022BBDC1-3BBE-4CA8-B82B-A5CA01088E58","skuPic":"/upload/image/original/20160229/c80d7c01-c90f-4e33-a0a1-ed4913153b80.jpg","externalColorId":"C80D7C01-C90F-4E33-A0A1-ED4913153B80","externalColorName":"矿石灰","internalColorId":"3C2F3CC4-B6FA-471B-BBCE-4C54ACF3DF99","internalColorName":"黑色","price":292000.00,"priceStr":"29.20","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"B9F25CAF-6870-4911-9FF0-21896898DE26","carModelName":"宝马1系 2015款 118i 领先型 欧V（符合国V标准）","officialPrice":256000.00,"officialPriceStr":"25.60","lowestPriceSku":{"skuId":"0014CC78-21EE-4F06-BDD7-A59F0104D9EB","skuPic":"/upload/image/original/201512/021051525788.jpg","externalColorId":"531AB7E4-FD89-4EAF-9AC1-4628973A1234","externalColorName":"深海蓝","internalColorId":"67CBEB65-3C63-4683-9E83-F0693CC60565","internalColorName":"黑色/珍珠贝白色","price":256000.00,"priceStr":"25.60","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"F8626E23-3E7D-440C-BAC5-A598012790EA","carModelName":"宝马1系 2016款 118i 都市设计套装 国V","officialPrice":276000.00,"officialPriceStr":"27.60","lowestPriceSku":{"skuId":"0C08683A-8B7E-4645-A48B-A59F01511A55","skuPic":"/upload/image/original/批量上传/宝马1系/星光棕.jpg","externalColorId":"B93E1C6C-6D6A-4FF4-B82B-A598012790F2","externalColorName":"星光棕","internalColorId":"83C07661-F4F5-4B58-AF28-A59900A48581","internalColorName":"黑色/珍珠贝白色","price":209760.00,"priceStr":"20.98","discount":66240.00,"status":"no_stock","remark":"无"}},{"carModelId":"68D5D504-1ED8-4885-BC06-6F15CD099755","carModelName":"宝马1系 2015款 120i 运动设计套装 欧IV（符合国IV标准）","officialPrice":306000.00,"officialPriceStr":"30.60","lowestPriceSku":{"skuId":"001D5D8F-C301-4B16-B7EC-A5CB0005B4F4","skuPic":"/upload/image/original/20160229/36193dcb-e94b-40ca-ad4c-d3a2e752e630.jpg","externalColorId":"36193DCB-E94B-40CA-AD4C-D3A2E752E630","externalColorName":"宝石青","internalColorId":"0A1C36BF-0F1D-4D42-B4EB-7B33832314A3","internalColorName":"黑色/珍珠贝白色","price":306000.00,"priceStr":"30.60","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"930009A5-F64B-463C-9CA0-70182CF1B1FD","carModelName":"宝马1系 2015款 125i M 运动型 欧IV（符合国IV标准）","officialPrice":372000.00,"officialPriceStr":"37.20","lowestPriceSku":{"skuId":"016894B2-6BBC-47EB-AE32-A5CA00DE07B4","skuPic":"/upload/image/original/批量上传/宝马1系/矿石白.jpg","externalColorId":"99F903D1-C221-4194-8E8E-DF44FA44F7BA","externalColorName":"矿石白","internalColorId":"CA4113BA-6F9F-492D-A66B-3A71D238E3FB","internalColorName":"黑色","price":372000.00,"priceStr":"37.20","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"ED46671B-1451-4988-B202-09F95721257B","carModelName":"宝马1系 2012款 116i 手动挡 国V","officialPrice":242000.00,"officialPriceStr":"24.20","lowestPriceSku":{"skuId":"DA346ED7-6076-4332-8F65-A58D00EA023F","skuPic":"/images/head.jpg","externalColorId":"77B530D5-1FBA-4CB8-AC10-BFEFD4E411D4","externalColorName":"巴伦西亚橙","internalColorId":"0AF4368C-C993-4B8D-ACBE-CCBF9162AD94","internalColorName":"黑色/珍珠贝白色","price":241001.00,"priceStr":"24.10","discount":999.00,"status":"no_stock","remark":"无"}},{"carModelId":"60073A99-608C-4713-B247-55876A7ED2E3","carModelName":"宝马1系 2015款 118i 都市设计套装 欧IV（符合国IV标准）","officialPrice":276000.00,"officialPriceStr":"27.60","lowestPriceSku":{"skuId":"0F0CBF17-2CE3-4453-A302-A5CA00FA7B7B","skuPic":"/upload/image/original/20160229/bc07b390-73ba-4197-80a1-71dee0db143c.jpg","externalColorId":"BC07B390-73BA-4197-80A1-71DEE0DB143C","externalColorName":"星光棕","internalColorId":"00E78589-6F7E-408F-B8D1-E6B262AD987F","internalColorName":"黑色/珍珠贝白色","price":276000.00,"priceStr":"27.60","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"938EEA39-B627-40CA-8B7A-22525D5672D0","carModelName":"宝马1系 2015款 M135i 欧IV（符合国IV标准）","officialPrice":496000.00,"officialPriceStr":"49.60","lowestPriceSku":{"skuId":"03EE4AEB-B198-4687-BF6B-A5CA00F7E590","skuPic":"/upload/image/original/20160229/bc11cee1-d70a-48cd-915c-59a09fe52ff6.jpg","externalColorId":"BC11CEE1-D70A-48CD-915C-59A09FE52FF6","externalColorName":"巴伦西亚橙","internalColorId":"32A68B14-7D87-4227-9591-9F384DB608D1","internalColorName":"黑色","price":496000.00,"priceStr":"49.60","discount":0.00,"status":"no_stock","remark":"无"}},{"carModelId":"246CCAF9-F04E-4031-BEAC-88541EB8F3A2","carModelName":"宝马1系 2015款 118i 都市设计套装 欧V（符合国V标准）","officialPrice":276000.00,"officialPriceStr":"27.60","lowestPriceSku":{"skuId":"012C14A1-9627-447F-81E7-A59C00AFF4C1","skuPic":"/upload/image/original/201512/021055283935.jpg","externalColorId":"CBDA0C3D-4EF8-459B-A35E-B60B0FF0F3E2","externalColorName":"黑色","internalColorId":"19541B5B-6816-46FC-BBF4-32F5F6A21720","internalColorName":"黑色","price":209760.00,"priceStr":"20.98","discount":66240.00,"status":"no_stock","remark":"无"}},{"carModelId":"01C24262-731D-47C5-A6AF-AB482F2A9674","carModelName":"宝马1系 2015款 125i M 运动型 欧V（符合国V标准）","officialPrice":372000.00,"officialPriceStr":"37.20","lowestPriceSku":{"skuId":"098CA64F-F58E-4DA3-88E9-A59C00B40E0D","skuPic":"/upload/image/original/201512/021047294006.jpg","externalColorId":"3330EDD8-3E91-4B72-93B1-E0C35C7FBBD1","externalColorName":"深海蓝","internalColorId":"2990E7CD-D9F0-4BD1-A942-188860E65F8A","internalColorName":"黑色/珍珠贝白色","price":372000.00,"priceStr":"37.20","discount":0.00,"status":"no_stock","remark":"无"}}],
		windowHeight: '',
		carModelsHeight: ''
  },
	onLoad() {
		let that = this;
		let HTTPS_URL = app.config.ymcServerHTTPSUrl;
		try {
      let res = wx.getSystemInfoSync();
			let carModelsHeight;
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
			carModelsHeight = res.windowHeight - 55;
      this.setData({
				windowHeight: res.windowHeight + 'px',
				carModelsHeight: carModelsHeight+ 'px'
			})
    } catch (e) {
      
    }
	},
	headlerSearchInput(e) {
		let val = e.detail.value;
		let that = this;
		let searchResults = [];
		if(val) {
			for (var i = 0; i < that.data.newSearchResults.length; i++) {
				let item = that.data.newSearchResults[i]
				if(item.val.indexOf(val) != -1) {
					searchResults.push(item);
				}
			}	
		}
		that.setData({
			searchResults: searchResults
		})
		console.log(val,searchResults)
	},
	handlerToCarSources (e) {
		let carModelsInfo = JSON.stringify(e.currentTarget.dataset.carmodelsinfo);
		wx.navigateTo({  
      url: '../carSources/carSources?carModelsInfo='+ carModelsInfo
    }) 
	},
	handlerPromptly (e) {
		let carModelsInfo = JSON.stringify(e.currentTarget.dataset.carmodelsinfo);
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?carModelsInfo='+ carModelsInfo
    }) 
	}
})