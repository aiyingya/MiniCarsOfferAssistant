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
 * 贷款实际偿还金额
 */
let totalPaymentByLoan = function(annualRate, stages) {
  return 150109;
}

module.exports = {
  formatTime: formatTime,
  totalPaymentByLoan: totalPaymentByLoan
}
