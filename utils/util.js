function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 贷款月供计算公式
 *
 * @param carPrice      裸车价, 元
 * @param paymentRatio  首付比例, %
 * @param expenseRate   费率, %
 * @param stages        期数, 月数
 * @returns {number}    月供金额, 元
 */
let monthlyLoanPaymentByLoan = function(carPrice, paymentRatio, expenseRate, stages) {
  let loanPayment = loanPaymentByLoan(carPrice, paymentRatio, expenseRate)
  return (loanPayment / stages);
}

/***
 * 贷款总额计算公式
 *
 * @param carPrice      裸车价, 元
 * @param paymentRatio  首付比例，%
 * @param expenseRate   费率, %
 * @returns {number}    贷款总额，元
 */
let loanPaymentByLoan = function (carPrice, paymentRatio, expenseRate) {
  return (carPrice * (100 - paymentRatio) * 0.01 * (expenseRate * 0.01 + 1))
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
let advancePaymentByLoan = function(carPrice, paymentRatio, requiredExpenses, otherExpenses) {
  return (carPrice * paymentRatio * 0.01 + requiredExpenses + otherExpenses)
}

/***
 * 总费用计算公式
 *
 * @param carPrice          裸车价，元
 * @param paymentRatio      首付比例，%
 * @param expennseRate      费率，%
 * @param stages            期数，月数
 * @param requiredExpenses  必要花费，元
 * @param otherExpenses     其他话费，元
 * @returns {number}        总费用，元
 */
let totalPaymentByLoan = function (carPrice, paymentRatio, expennseRate, stages, requiredExpenses, otherExpenses) {
  let advancePayment = advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses)
  let loanPayment = loanPaymentByLoan(carPrice, paymentRatio, expennseRate)
  return (advancePayment + loanPayment)
}

/***
 * 优惠价格公式
 *
 * @param price
 * @param originPrice
 * @return {number}
 */
let downPrice = function (price, originPrice) {
  return (originPrice - price)
}

/***
 * 优惠价格字符串显示
 * @param downPrice
 * @return {string}
 */
let priceStringWithUnit = function (downPrice) {
  downPrice = Math.abs(downPrice)
  if (downPrice > 10000) {
    return (downPrice / 10000).toFixed(2) + '万'
  } else {
    return downPrice.toFixed() + '元'
  }
}

let downPriceFlag = function (downPrice) {
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
 * 优惠点数公式
 * @param price       修改价格
 * @param originPrice 原价格
 * @return {number}
 */
let downPoint = function (price, originPrice) {
  return (Math.abs(originPrice - price) * 100 / originPrice)
}

/**
 * [dateDiff 算时间差]
 * @param  {[type=Number]} hisTime [历史时间戳，必传]
 * @param  {[type=Number]} nowTime [当前时间戳，不传将获取当前时间戳]
 * @return {[string]}         [string]
 */
let dateDiff = function(date, nowDate){
  const now = nowDate ? nowDate: new Date().getTime()
  const diffValue = now - date
  let result=""

  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const halfamonth = day * 15
  const month = day * 30
  const year = month * 12

  const _year = diffValue/year
  const _month = diffValue/month
  const _week = diffValue/(7 * day)
  const _day = diffValue/day
  const _hour = diffValue/hour
  const _min = diffValue/minute

  if(_year>=1)
    result = parseInt(_year) + "年前";
  else if(_month>=1)
    result = parseInt(_month) + "个月前";
  else if(_week>=1)
    result = parseInt(_week) + "周前";
  else if(_day>=1)
    result = parseInt(_day) +"天前";
  else if(_hour>=1)
    result = parseInt(_hour) +"个小时前";
  else if(_min>=1)
    result = parseInt(_min) +"分钟前";
  else
    result = "刚刚";
  return result;
}

module.exports = {
  formatTime: formatTime,
  totalPaymentByLoan: totalPaymentByLoan,
  advancePaymentByLoan: advancePaymentByLoan,
  loanPaymentByLoan: loanPaymentByLoan,
  monthlyLoanPaymentByLoan: monthlyLoanPaymentByLoan,
  downPrice: downPrice,
  priceStringWithUnit: priceStringWithUnit,
  downPoint: downPoint,
  downPriceFlag: downPriceFlag,
  dateDiff: dateDiff
}
