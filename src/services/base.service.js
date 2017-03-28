/**
 * Created by David on 28/03/2017.
 */

import config from '../lib/config'
import modules from '../lib/modules'

class Services {

  constructor () {

  }

  urls = {}

  sendMessage(opts) {
    const _HTTPS = `${this.urls[config.ENV]}${opts.path}`
    const module = new modules
    module.request({
      url: _HTTPS,
      method: opts.method,
      header: opts.header,
      data: opts.data,
      success: opts.success,
      fail: opts.fail,
      loadingType: 'none'
    })
  }
}

export default Services
