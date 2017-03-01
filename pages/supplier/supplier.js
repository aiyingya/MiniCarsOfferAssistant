let app = getApp()
Page({
	data: {
		supplierList: [
			{id:'1'},
			{id:'2'},
			{id:'3'}
		],
		lastX: '',
		lastY: '',
		startX: '',
		moveX: '',
		touchElement: {},
		delBtnWidth: 300
	},
	onLoad() {
    let that = this
		try {
      let res = wx.getSystemInfoSync()
			
			let windowHeight = res.windowHeight -5
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({windowHeight: windowHeight + 'px'})
    } catch (e) {
      
    }
	},
	handletouchmove(event) {
		let currentX = event.touches[0].clientX
		let moveX = this.data.startX - currentX
		let X = Math.abs(moveX) < 100 ? moveX : 100
		let delBtnWidth = this.data.delBtnWidth;
		let txtStyle = "";
		if(moveX == 0 || moveX < 0){ //如果移动距离小于等于0，文本层位置不变
			txtStyle = 'left:0'
		}else if(moveX > 0 ){ //移动距离大于0，文本层left值等于手指移动距离
			txtStyle = `left-${moveX}px`
			if(moveX >= delBtnWidth){
				//控制手指移动距离最大值为删除按钮的宽度
				txtStyle = `left:-${delBtnWidth}rpx`
			}
		}
		//获取手指触摸的是哪一项
		let index = event.currentTarget.dataset.index;
		let list = this.data.supplierList;
		
		list[index].txtStyle = txtStyle; 
		//更新列表的状态
		this.setData({
		 supplierList:list
		})
	},
	handletouchtart:function(event) { 	
		if(event.touches.length === 1){
      this.data.startX = event.touches[0].clientX
    } 
  },
	handletouchend:function(e){
    
		let that = this
    if(e.changedTouches.length==1){
      //手指移动结束后水平位置
      let endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      let disX = that.data.startX - endX;
      let delBtnWidth = that.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      let txtStyle = disX > delBtnWidth/2 ? `left:-${delBtnWidth}rpx` : 'left:0'
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index;
      let list = that.data.supplierList;
      that.data.supplierList[index].txtStyle = txtStyle; 
      //更新列表的状态
      that.setData({
       supplierList:list
      });
		}
  }
})