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
let downPriceString = function (downPrice) {
  if (downPrice > 10000) {
    return (downPrice / 10000).toFixed(2) + '万元'
  } else {
    return downPrice.toFixed() + '元'
  }
}

/***
 * 优惠点数公式
 * @param price       修改价格
 * @param originPrice 原价格
 * @return {number}
 */
let downPoint = function (price, originPrice) {
  return ((originPrice - price) * 100 / originPrice)
}

module.exports = {
  formatTime: formatTime,
  totalPaymentByLoan: totalPaymentByLoan,
  advancePaymentByLoan: advancePaymentByLoan,
  loanPaymentByLoan: loanPaymentByLoan,
  monthlyLoanPaymentByLoan: monthlyLoanPaymentByLoan,
  downPrice: downPrice,
  downPriceString: downPriceString,
  downPoint: downPoint
}
