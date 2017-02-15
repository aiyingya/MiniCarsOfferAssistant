/**
 * track 
 * 基于微信小程序页面埋点.
 * v 1.0.0
 * author pandali
 * mail pandazoer@163.com
 */

class Track {
	
	constructor($scope) {
    Object.assign(this, {
      $scope,
    })
    this.__init()
  }
	
	__HTTPS(evn) {
		let HTTPS = {
			dev: 'https://ubt.yaomaiche.com/acquire/report/',
			gqc: 'https://ubt.yaomaiche.com/acquire/report/',
			prd: 'https://ubt.yaomaiche.com/acquire/report/'
		};
		return HTTPS[evn];
	}
	/**
   * 初始化类方法
   */
  __init() {
    this.__initDefaults()
    this.__initPush()
  }

  /**
   * 默认参数
   */
  __initDefaults() {
    this.Track = {
      push: {
        version: '1.0.0',
      },
    }

    this.$scope.setData({
      [`$Track`]: this.$Track
    })
  }
	
	__initPush() {
		const that = this
    const $scope = that.$scope
		
		that.$TrackPush = {
      /**
       * 默认参数
       */
      defaults: {
        showCancel: !0,
        title: '',
        content: ''
        
      }
      
			
    }
	}
	
	/**
	 * 获取页面信息.
	*/
	__getPagesInfo() {
		
	}
	
	
	
}

export default Track