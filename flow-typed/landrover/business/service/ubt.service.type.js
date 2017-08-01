/**
 * ubt 的上报页面时间实体
 *
 * 目前字段并不全面, 需要更新处理
 */
declare type PageEvent = {
      deviceType: string, // 设备类型
      appVersion: string, // APP 版本 {{name}}:{{version}}
      pageId: string,
      pageName: string,
      ymc_userkey: string, // 对应 ubt 表中的 guid
      channel: 'mini-program' | 'h5' | 'wechat', // 上报渠道目前只有小程序的 'mini-program'
      os: string, // 通畅环境只需要提供 {{操作系统以及版本号}} 小程序需要提供 {{操作系统以及版本号}}|wechat {{微信客户端版本号}}|sdk {{小程序 sdk 版本号}}
      screen: string, // {{屏幕像素宽}}x{{屏幕像素高}}
      language: string,
      phoneModel: string,
      deviceId: string,
      eventAction: string,
      eventLabel: string,
      eventSource: string,
      eventValue: number,
      eventCategory: string,
      productId: string | number,
      color: string
};
