let app = getApp()
Page({
	data: {
		supplierList: [{index:1}],
		lastX: '',
		lastY: '',
		moveX: ''
	},
	handletouchmove(event) {
		let currentX = event.touches[0].pageX
    let currentY = event.touches[0].pageY

    console.log(currentX)
    console.log(this.data.lastX)
    let text = ""
    if ((currentX - this.data.lastX) < 0){
    	 text = "向左滑动"
    }else if (((currentX - this.data.lastX) > 0)){
    	text = "向右滑动"
    }
      
		this.setData({
			moveX: currentX
		})	
		console.log(text)	
	},
	handletouchtart:function(event) { 
    this.data.lastX = event.touches[0].pageX
    this.data.lastY = event.touches[0].pageY
  }
})