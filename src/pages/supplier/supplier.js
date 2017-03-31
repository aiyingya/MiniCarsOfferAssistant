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
		let currentX = event.changedTouches[0].clientX
		let moveX = this.data.startX - currentX
		let delBtnWidth = this.data.delBtnWidth
		let index = event.currentTarget.dataset.index
		let supplierList = this.data.supplierList

		let X = ''
		let Style = ""

		if(Math.abs(moveX) < 40 ) {
			X = moveX
		}else if(Math.abs(moveX) > 40 && Math.abs(moveX) < delBtnWidth/2) {
			X = 100
		}else if(Math.abs(moveX) > delBtnWidth/2) {
			X = delBtnWidth
		}

		if(moveX > 10){
			Style = `left:-${X}rpx`
		}
		for(let item of supplierList) {
			item.Style = 'left:0'
		}
		supplierList[index].Style = Style
		console.log(supplierList)
		//更新列表的状态
		this.setData({
		 supplierList: supplierList
		})
	},
	handletouchtart:function(event) {
		if(event.touches.length === 1){
      this.data.startX = event.touches[0].clientX
    }
  },
	handletouchend:function(e){
		let that = this
		let supplierList = this.data.supplierList
		let endX = e.changedTouches[0].clientX
		let moveX = that.data.startX - endX

		if(moveX < 40) {
			for(let item of supplierList) {
				item.Style = 'left:0'
			}

			this.setData({
			 supplierList: supplierList
			})
		}
  }
})
