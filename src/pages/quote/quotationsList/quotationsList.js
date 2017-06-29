import util from '../../../utils/util'
let app = getApp()

Page({
  data: {
    pageIndex: 1,
    pageSize: 10,
    quotationsList: [],
    // {
    //    viewModel: {
    //      sellingPrice: '',
    //      guidePrice: '',
    //      totalPrice: '',
    //      priceChange: {
    //        flag: true,
    //        price: '',
    //      }
    //    },
    // }
    empty: false,
    windowHeight: '',
    lastX: '',
		lastY: '',
		startX: '',
		moveX: '',
		touchElement: {},
		delBtnWidth: 150,
    checkMoreNumber: 2
  },
  onLoad() {
    let that = this;

    try {
      var res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }
  },
  onReady() {
  },
  onShow() {
    
    let that = this
    let quotation = app.fuckingLarryNavigatorTo.quotation
    let source = app.fuckingLarryNavigatorTo.source

    if (quotation && typeof quotation === 'object') {
      if (source === 'quotationDetail') {
        this.getData({
          complete: function () {
            that.delayNavigationTo({
              complete: function () {
                /// 报价列表页面也换过来
                const quotationKeyValueString = util.urlEncodeValueForKey('quotation', quotation)
                wx.navigateTo({
                  url: '/pages/quote/quotationDetail/quotationDetail?' + quotationKeyValueString,
                  success: function (res) {
                  },
                  fail: function () {
                  },
                  complete: function () {
                    app.fuckingLarryNavigatorTo.quotation = null
                    app.fuckingLarryNavigatorTo.source = null
                  }
                })
              }
            })
          }
        })
      } else {
        this.getData({
          complete: function () {
            that.delayNavigationTo({
              complete: function () {
                /// 找车路径切换过来
                const quotationKeyValueString = util.urlEncodeValueForKey('quotation', quotation)
                wx.navigateTo({
                  url: '/pages/quote/quotationDetail/quotationDetail?' + quotationKeyValueString,
                  success: function (res) {
                  },
                  fail: function () {
                  },
                  complete: function () {
                    app.fuckingLarryNavigatorTo.quotation = null
                    app.fuckingLarryNavigatorTo.source = null
                  }
                })
              }
            })
          }
        })
      }
    } else {
      this.getData({})
    }
  },
  onHide() {
  },
  onUnload() {
  },
  onReachBottom() {
    // 上拉加载更多
    let that = this

    let originPageIndex = this.data.pageIndex
    let newPageIndex = this.data.pageIndex + 1

    app.saasService.requestQuotationsList(newPageIndex, this.data.pageSize, {
      loadingType: 'none',
      success: function (res) {
        if (res.content.length !== 0) {
          that.data.pageIndex = newPageIndex
          for(let item of res.content) {
            item.checkMoreNumber = 2
          }
          that.setData({
            quotationsList: that.data.quotationsList.concat(res.content)
          })
        } else {
          that.data.pageIndex = originPageIndex
        }
      },
      fail: function () {
        that.data.pageIndex = originPageIndex
      },
      complete: function () {

      }
    });
  },
  onPullDownRefresh() {
    // 下拉刷新
    let that = this
    this.getData({
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  },
  delayNavigationTo(object) {
    wx.showToast({
      title: "正在处理",
      icon: 'loading'
    })
    setTimeout(function () {
      typeof object.complete === 'function' && object.complete()
      wx.hideToast()
    }, 1000)
  },
  /**
   * 计算时差.
   */
  getTimeDifference(starttime) {
    var t = Date.parse(new Date()) - Date.parse(starttime);
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  },
  getData(object) {
    let that = this
    this.data.pageIndex = 1
    app.saasService.requestQuotationsList(this.data.pageIndex, this.data.pageSize, {
      loadingType: 'none',
      success: function (res) {
        
        let empty = res.content.length === 0
        console.log(res.content)
        that.setData({
          empty: empty,
          quotationsList: res.content
        })
        
        typeof object.complete === 'function' && object.complete()
      },
      fail: function () {
        
      },
      complete: function () {
      }
    })
  },
  handlerSelectQuotation(e) {
    let quotationKeyValueString = util.urlEncodeValueForKey('quotation', e.currentTarget.dataset.quotation)
    wx.navigateTo({
      url: '/pages/details/details?' + quotationKeyValueString,
      success: function (res) {
        console.log('quotationDetail 页面跳转成功');
      },
      fail: function () {
        console.log('quotationDetail 页面跳转失败');
      },
      complete: function () {

      }
    })
  },
  handletouchmove(event) {
		let currentX = event.changedTouches[0].clientX
		let moveX = this.data.startX - currentX
		let delBtnWidth = this.data.delBtnWidth
		let index = event.currentTarget.dataset.index
		let quotationsList = this.data.quotationsList

		let X = ''
		let Style = ""

		if(Math.abs(moveX) < (delBtnWidth/2) ) {
			X = moveX
		}else {
			X = delBtnWidth
		}

		if(moveX > 30){
			Style = `left:-${X}rpx`
		}
		for(let item of quotationsList) {
			item.Style = 'left:0'
		}
		quotationsList[index].Style = Style
		//更新列表的状态
		this.setData({
		 quotationsList: quotationsList
		})
	},
	handletouchtart:function(event) {
		if(event.touches.length === 1){
      this.data.startX = event.touches[0].clientX
    }
  },
	handletouchend:function(e){
		let that = this
		let quotationsList = this.data.quotationsList
    let delBtnWidth = this.data.delBtnWidth
		let endX = e.changedTouches[0].clientX
		let moveX = that.data.startX - endX
    
		if(moveX < (delBtnWidth/2)) {
			for(let item of quotationsList) {
				item.Style = 'left:0'
			}
      console.log(moveX,quotationsList)
			this.setData({
			 quotationsList: quotationsList
			})
		}
  },
  handleDeleteRecord(e) {
    const that = this
    const record = e.currentTarget.dataset.record
    const quotationId = record.quotationId
    const quotationsList = this.data.quotationsList
    const newQuotationsList = []
    app.saasService.requestDeleteRecotd(quotationId,{
      loadingType: 'true',
      success(res) {
        console.log(res)
        if(res) {
          for(let item of quotationsList) {
            if(item.quotationId != quotationId) {
              newQuotationsList.push(item)
            }
          }
//          wx.showModal({
//            title: '提示',
//            content: '这是一个模态弹窗',
//            success: function(res) {
//              if (res.confirm) {
//                that.setData({
//                  quotationsList: newQuotationsList
//                })
//              } else if (res.cancel) {
//                console.log('用户点击取消')
//              }
//            }
//          })
          that.setData({
            quotationsList: newQuotationsList
          })
        }
      }
    })
  },
  handleCheckMore(e) {
    const more = e.currentTarget.dataset.more
    const quotationsList = this.data.quotationsList
    console.log(e,more)
    for(let item of quotationsList) {
      if(more.quotationId === item.quotationId) {
        item.checkMoreNumber = more.quotationCount
      }
    }
    this.setData({
      quotationsList: quotationsList
    })
  }
})
