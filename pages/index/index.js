//index.js
var app = getApp()

Page({
  data: {
		hotCarLists: [
			{image:''},
			{image:''},
			{image:''},
			{image:''},
			{image:''},
			{image:''},
			{image:''},
			{image:''},
			{image:''},
			{image:''}
		],
    list: [
      {alphabet: 'A', datas: ['asome']},
      {alphabet: 'B', datas: ['bbsome','bebntries','bare here']},
      {alphabet: 'C', datas:  ['csome','centries','care here']},
      {alphabet: 'D', datas:  ['dsome','dentries','dare here']},
      {alphabet: 'E', datas:  ['esome','eentries','eare here']},
      {alphabet: 'F', datas:  ['fsome','fentries','are here']},
      {alphabet: 'G', datas:  ['gsome','gentries','gare here']},
      {alphabet: 'H', datas:  ['hsome','hentries','hare here']},
      {alphabet: 'I', datas:  ['isome','ientries','iare here']},
      {alphabet: 'J', datas:  ['jsome','jentries','jare here']},
      {alphabet: 'K', datas:  ['ksome','kentries','kare here']},
      {alphabet: 'L', datas:  ['lsome','lentries','lare here']},
      {alphabet: 'M', datas:  ['msome','mentries','mare here']},
      {alphabet: 'N', datas:  ['nsome','nentries','nare here']},
      {alphabet: 'O', datas:  ['osome','oentries','oare here']},
      {alphabet: 'P', datas:  ['psome','pentries','pare here']},
      {alphabet: 'Q', datas:  ['qsome','qentries','qare here']},
      {alphabet: 'R', datas:  ['rsome','rentries','rare here']},
      {alphabet: 'S', datas:  ['some','sentries','sare here']},
      {alphabet: 'T', datas:  ['tsome','tentries','tare here']},
      {alphabet: 'U', datas:  ['usome','uentries','uare here']},
      {alphabet: 'V', datas:  ['vsome','ventries','vare here']},
      {alphabet: 'W', datas:  ['wsome','wentries','ware here']},
      {alphabet: 'X', datas:  ['xsome','xentries','xare here']},
      {alphabet: 'Y', datas:  ['ysome','yentries','yare here']},
      {alphabet: 'Z', datas:  ['zsome','zentries','zare here']},
    ],
    alpha: '',
    windowHeight: '',
		showCarSeries: ''
  },
  //事件处理函数
  searchCarType: function() {
		console.log(2)
	},
  onLoad: function () {
    var that = this;
		try {
      var res = wx.getSystemInfoSync();
			console.log(res)
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
	handlerAlphaTap(e) {
    let {ap} = e.target.dataset;
		let that = this;
    that.setData({alpha: ap});
    that.setData({alphanetToast: ap});
  },
  handlerMove(e) {
    let {list} = this.data;
    let moveY = e.touches[0].clientY;
    let rY = moveY - this.offsetTop;
		let that = this;
    if(rY >= 0) {
      let index = Math.ceil((rY - that.apHeight)/ that.apHeight);
      if(0 <= index < list.length) {
        let nonwAp = list[index];
        nonwAp && that.setData({alpha: nonwAp.alphabet});
				that.setData({alphanetToast: nonwAp.alphabet});
      } 
    }
  },
	selectCarSeries(e) {
		let carSeries = e.currentTarget.dataset.carseries;
		console.log(carSeries)
	}
})
