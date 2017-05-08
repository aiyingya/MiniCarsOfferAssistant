import config from '../config'

export default class Util {

  static formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }

  static formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }


  /**
   * 贷款月供计算公式 方式1
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例, %
   * @param expenseRate   万元系数, 元
   * @param stages        期数, 月数
   * @returns {number}    月供金额, 元
   */
  static monthlyLoanPaymentByLoan(carPrice, paymentRatio, expenseRate) {
    let loanPayment = ((carPrice * (100 - paymentRatio) * 0.01)/10000 * expenseRate)
    return loanPayment;
  }

  /**
   * 贷款月供计算公式 方式2 1.5以后没有费率了
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例, %
   * @param expenseRate   费率, %
   * @param stages        期数, 月数
   * @returns {number}    月供金额, 元
   */
  static monthlyLoanPaymentByLoan2(carPrice, paymentRatio, expenseRate, stages) {
    let loanPayment = Util.loanPaymentByLoan(carPrice, paymentRatio, expenseRate)
    return (loanPayment / stages);
  }

  /***
   * 贷款+利息总额计算公式
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例，%
   * @param expenseRate   费率, %
   * @returns {number}    贷款总额，元
   */
  static loanPaymentByLoan(carPrice, paymentRatio, expenseRate) {
    return (carPrice * (100 - paymentRatio) * 0.01 * (expenseRate * 0.01 + 1))
  }

  /***
   * 贷款+利息总额计算公式
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例，%
   * @returns {number}    贷款总额，元
   */
  static loanPaymentByLoan1(carPrice, paymentRatio) {
    return (carPrice * (100 - paymentRatio) * 0.01)
  }

  /**
   * 首付计算公式
   *
   * @param carPrice          裸车价, 元
   * @param paymentRatio      首付比例, %
   * @param requiredExpenses  必要花费, 元
   * @param otherExpenses     其他话费, 元
   * @returns {number}        首付金额，元
   */
  static advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses) {
    return (carPrice * paymentRatio * 0.01 + requiredExpenses + otherExpenses)
  }

  /***
   * 总费用（贷款首付+贷款+利息）计算公式
   *
   * @param carPrice          裸车价，元
   * @param paymentRatio      首付比例，%
   * @param expennseRate      费率，%
   * @param stages            期数，月数
   * @param requiredExpenses  必要花费，元
   * @param otherExpenses     其他话费，元
   * @returns {number}        总费用，元
   */
  static totalPaymentByLoan(carPrice, paymentRatio, expennseRate, stages, requiredExpenses, otherExpenses) {
    let advancePayment = Util.advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses)
    let loanPayment = Util.loanPaymentByLoan(carPrice, paymentRatio, expennseRate)
    return (advancePayment + loanPayment)
  }

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
  static quotedPriceByMethod(price, originPrice, quotedMethod = 'PRICE') {
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

      const range = Util.quotedPriceUnit(price)
      const quotedRange = range.quotedRange
      const quotedRangeUnit = range.quotedRangeUnit

      return {
        quotedMethod,
        quotedSymbol,
        quotedRange,
        quotedRangeUnit
      }
    } else {
      return Util.quotedPriceWithPriceDiffByMethod(priceDiff, originPrice, quotedMethod)
    }
  }

  static quotedPriceWithPriceDiffByMethod(priceDiff, originPrice, quotedMethod = 'PRICE') {
    let quotedSymbol
    let quotedValue
    let quotedRange
    let quotedRangeUnit
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

    if (quotedMethod === 'PRICE') {
      const range = Util.quotedPriceUnit(abs_diff)
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

  static quotedPriceWithDownPriceByFlag(priceDiff, originPrice, priceOrPoints = true) {
    const quotedMethod = priceOrPoints ? 'PRICE' : 'POINTS'
    return Util.quotedPriceWithPriceDiffByMethod(priceDiff, originPrice, quotedMethod)
  }

  static quotedPriceByFlag(price, originPrice, priceOrPoints = true) {
    const quotedMethod = priceOrPoints ? 'PRICE' : 'POINTS'
    return Util.quotedPriceByMethod(price, originPrice, quotedMethod)
  }

  static quotedPriceUnit(price) {
    const abs_price = Math.abs(price)
    let quotedRangeUnit
    let quotedRange
    if (abs_price > 10000) {
      quotedRange = (abs_price / 10000).toFixed(2)
      quotedRangeUnit = '万元'
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

  static downPriceFlag(downPrice) {
    console.log(downPrice)
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
    return  originPrice * (1 + point*0.01)
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
}
