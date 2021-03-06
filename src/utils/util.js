import moment from 'moment'
// @flow
export default class Util {
  /**
   * 降价数据
   *
   * @static
   * @param {Number} price
   * @param {Number} originPrice
   * @param {STRING} quotedMethod DIRECT|PRICE|POINTS
   * @returns {Object} object.quotedMethod DIRECT|PRICE|POINTS
   *          {String} object.quotedSymbol DOWN|PLUS|NONE
   *          {Number} object.quotedValue 降点值
   *          {Number} object.quotedRange 降价范围
   *          {String} object.quotedRangeUnit 降价单位
   *
   * @memberOf Util
   */
  static quotedPriceByMethod(price, originPrice, quotedMethod = 'PRICE', pretty = true): PriceQuoted {
    let quotedSymbol
    const priceDiff = Util.downPrice(price, originPrice)

    if (quotedMethod === 'DIRECT') {
      if (priceDiff === 0) {
        quotedSymbol = 'NONE'
        return {
          quotedMethod,
          quotedSymbol
        }
      } else if (priceDiff > 0) {
        quotedSymbol = 'DOWN'
      } else {
        quotedSymbol = 'PLUS'
      }

      const abs_diff = Math.abs(priceDiff)

      const range = Util.quotedPriceUnit(price, pretty)
      const quotedRange = range.quotedRange
      const quotedRangeUnit = range.quotedRangeUnit

      return {
        quotedMethod,
        quotedSymbol,
        quotedRange,
        quotedRangeUnit
      }
    } else {
      return Util.quotedPriceWithPriceDiffByMethod(priceDiff, originPrice, quotedMethod, pretty)
    }
  }

  static quotedPriceWithPriceDiffByMethod(priceDiff, originPrice, quotedMethod = 'PRICE', pretty = true): PriceQuoted {
    let quotedSymbol
    let quotedValue
    let quotedRange
    let quotedRangeUnit
    if (priceDiff === 0) {
      quotedSymbol = 'NONE'
      if (quotedMethod === 'POINTS') {
        quotedValue = 0
        return {
          quotedValue,
          quotedMethod,
          quotedSymbol
        }
      } else if (quotedMethod === 'PRICE') {
        quotedRange = 0
        quotedRangeUnit = ''
        return {
          quotedRange,
          quotedRangeUnit,
          quotedMethod,
          quotedSymbol
        }
      }
    } else if (priceDiff > 0) {
      quotedSymbol = 'DOWN'
    } else {
      quotedSymbol = 'PLUS'
    }
    const abs_diff = Math.abs(priceDiff)

    if (quotedMethod === 'PRICE') {
      const range = Util.quotedPriceUnit(abs_diff, pretty)
      quotedRange = range.quotedRange
      quotedRangeUnit = range.quotedRangeUnit
    } else if (quotedMethod === 'POINTS') {
      quotedValue = ((abs_diff / originPrice) * 100).toFixed(2)
    } else {
      return null
    }

    return {
      quotedMethod,
      quotedSymbol,
      quotedValue,
      quotedRange,
      quotedRangeUnit
    }
  }

  static quotedPriceWithDownPriceByFlag(priceDiff, originPrice, priceOrPoints = true): PriceQuoted {
    const quotedMethod = priceOrPoints ? 'PRICE' : 'POINTS'
    return Util.quotedPriceWithPriceDiffByMethod(priceDiff, originPrice, quotedMethod)
  }

  static quotedPriceByFlag(price, originPrice, priceOrPoints = true) {
    const quotedMethod = priceOrPoints ? 'PRICE' : 'POINTS'
    return Util.quotedPriceByMethod(price, originPrice, quotedMethod)
  }

  static quotedPriceUnit(price, pretty = true) {
    const abs_price = Math.abs(price)
    let quotedRangeUnit
    let quotedRange
    if (pretty) {
      if (abs_price > 10000) {
        quotedRange = (abs_price / 10000).toFixed(2)
        quotedRangeUnit = '万'
      } else {
        quotedRange = abs_price
        quotedRangeUnit = '元'
      }
    } else {
      quotedRange = abs_price
      quotedRangeUnit = '元'
    }
    return {
      quotedRange,
      quotedRangeUnit
    }
  }

  /***
   * 优惠价格公式
   *
   * @param price
   * @param originPrice
   * @return {number}
   */
  static downPrice(price, originPrice) {
    return (originPrice - price)
  }

  /***
   * 优惠价格字符串显示
   * @param downPrice
   * @return {string}
   */
  static priceStringWithUnit(downPrice) {
    downPrice = Math.abs(downPrice)
    if (downPrice >= 10000) {
      return (downPrice / 10000).toFixed(2) + '万'
    } else {
      return downPrice.toFixed()
    }
  }

  /***
   * 优惠价格字符串显示
   * @param downPrice
   * @return {string}
   */
  static priceStringWithUnitNumber(downPrice) {
    downPrice = Math.abs(downPrice)
    if (downPrice >= 10000) {
      return (downPrice / 10000).toFixed(2)
    } else {
      return downPrice.toFixed()
    }
  }

  /***
   * 优惠价格字符串显示
   * @param downPrice
   * @return {string}
   */
  static priceAbsStringWithUnitNumber(downPrice) {
    return (Number(downPrice) / 10000).toFixed(2)
  }

  static downPriceFlag(downPrice) {
    if (downPrice === 0) {
      return 0;
    } else if (downPrice > 0) {
      return 1;
    } else if (downPrice < 0) {
      return -1;
    }
  }


  /***
   * 优惠点数公式 （以下关联）
   * @param price       修改价格
   * @param originPrice 原价格／指导价
   * @return {number}
   */
  static downPoint(price, originPrice) {
    return (Math.abs(originPrice - price) * 100 / originPrice)
  }

  /***
   * 获取价格公式 （以上关联）
   * @param point       优惠点数 可以是正数 也可以是负数
   * @param originPrice 原价格／指导价
   * @return {number}
   */
  static carPrice(point, originPrice) {
    return originPrice * (1 + point * 0.01)
  }

  static dateCompatibility(dateString) {
    if (dateString && dateString.length) {
      const dateCompatibilityString = dateString.replace(/-/g, '/')
      const dateCompatibility = new Date(dateCompatibilityString)
      return dateCompatibility
    } else {
      return new Date()
    }
  }

  /***
   * 获取加价／减价 加点／减点之后裸车价的金额
   * @param isPlus  ／OrDown     是加价  否减价  裸车价-指导价
   * @param isPoint  ／OrPrice  是加点   否减点
   * @param guidePrice  指导价金额
   * @param contentNum   要变更的金额
   * @return {number}
   */
  static getChangeCarPrice(isPlus, isPoint, guidePrice, contentNum) {
    let _contentNum = isPlus ? Number(contentNum) : Number(-Number(contentNum))
    let price
    if (isPoint) {
      price = Util.carPrice(_contentNum, guidePrice)
    } else {
      price = Math.floor(guidePrice + _contentNum)
    }
    return price
  }

  /**
   * [dateDiff 算时间差]
   * @param  {[type=Number]} hisTime [历史时间戳，必传]
   * @param  {[type=Number]} nowTime [当前时间戳，不传将获取当前时间戳]
   * @return {[string]}         [string]
   */
  static dateDiff(date, nowDate) {
    const now = nowDate ? nowDate : new Date().getTime()
    const diffValue = now - date
    let result = ""

    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24
    const halfamonth = day * 15
    const month = day * 30
    const year = month * 12

    const _year = diffValue / year
    const _month = diffValue / month
    const _week = diffValue / (7 * day)
    const _day = diffValue / day
    const _hour = diffValue / hour
    const _min = diffValue / minute

    if (_year >= 1) {
      result = parseInt(_year) + "年前"
    } else if (_month >= 1) {
      result = parseInt(_month) + "个月前"
    } else if (_week >= 1) {
      result = parseInt(_week) + "周前"
    } else if (_day >= 1) {
      result = parseInt(_day) + "天前"
    } else if (_hour >= 1) {
      result = parseInt(_hour) + "小时前"
    } else if (_min >= 1) {
      result = parseInt(_min) + "分钟前"
    } else {
      result = "刚刚"
    }
    return result;
  }

  /**
   * 日期格式化
   * @param timestr 时间字符串
   * @param fmt 格式化样式 YYYY/MM/DD hh:mm
   * @returns {string} 返回格式化以后的时间字符串
   */
  static getTimeStr(timestr, fmt) {
    return moment(timestr).format(fmt)
  }

  static urlEncodeValueForKey(key, value) {
    if (value && typeof value === 'object') {
      const valueString = JSON.stringify(value)
      return key + '=' + encodeURIComponent(valueString)
    } else {
      return ''
    }
  }

  static urlDecodeValueForKeyFromOptions(key, options) {
    const valueString = decodeURIComponent(options[key])
    const value = JSON.parse(valueString)
    return value
  }

  /**
   * 计算时差.
   */
  static getTimeDifference(starttime) {
    const t = Date.parse(new Date()) - Date.parse(starttime)
    const seconds = Math.floor((t / 1000) % 60)
    const minutes = Math.floor((t / 1000 / 60) % 60)
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24)
    const days = Math.floor(t / (1000 * 60 * 60 * 24))
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    }
  }

  /**
   * 计算时差.
   */
  static getTimeDifferenceString(time) {
    if (!time) return '暂无浏览记录'
    let stime = time.replace(/-/g, '/')
    let endTime = new Date(stime)
    let difference = Util.getTimeDifference(endTime)

    let month = (endTime.getMonth() + 1) > 9 ? (endTime.getMonth() + 1) : `0${endTime.getMonth() + 1}`
    let days = endTime.getDate() > 9 ? endTime.getDate() : `0${endTime.getDate()}`
    let hours = endTime.getHours() > 9 ? endTime.getHours() : `0${endTime.getHours()}`
    let minutes = endTime.getMinutes() > 9 ? endTime.getMinutes() : `0${endTime.getMinutes()}`

    if (difference.days >= 2) {
      return `${month}/${days} ${hours}:${minutes}`
    } else if (0 < difference.days && difference.days < 2) {
      return `一天前 ${hours}:${minutes}`
    } else if (difference.days == 0 && difference.hours > 0) {
      return `${difference.hours}小时前 ${hours}:${minutes}`
    } else if (difference.days == 0 && difference.hours == 0) {
      return `刚刚 ${hours}:${minutes}`
    }
  }

  /**
   * 时间不足10返回0X格式.
   */
  static makeUpZero(s) {
    return s < 10 ? `0${s}` : s;
  }
}
