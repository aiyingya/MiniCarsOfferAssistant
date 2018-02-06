// @flow

/**
 * 计算中注意关注两个名词
 *
 * percentage
 * ratio
 *
 * @export
 * @class Calculate
 */
export default class Calculate {
  /**
   * 裸车价
   *
   * @type {number}
   * @memberof Calculate
   */
  nakedCarPrice: number = 0;

  /**
   * 期数，按月计算
   *
   * @type {number}
   * @memberof Calculate
   */
  stages: number = 0;

  /**
   * 首付比例
   *
   * @type {number}
   * @memberof Calculate
   */
  downPaymentRate: number = 0;

  /**
   * 首付总额
   * 首付比例
   *
   * @type {number}
   * @memberof Calculate
   */
  _downPaymentAmount: number = 0;

  // $FlowFixMe
  get downPaymentAmount(): number {
    return this.numberFormat(this._downPaymentAmount)
  }

  // $FlowFixMe
  set downPaymentAmount(value: number) {
    if (typeof value === 'number') {
      if (value > this.nakedCarPrice) {
        this._downPaymentAmount = this.nakedCarPrice
      } else if (value < 0) {
        this._downPaymentAmount = 0
      } else {
        this._downPaymentAmount = value
      }
    } else {
      this._downPaymentAmount = 0
    }
  }

  /**
   * 购车车辆中的贷款金额
   *
   * 落地价中 贷款金额
   *
   * @type {number}
   * @memberof Calculate
   */
  _loanPaymentAmount: number = 0;

  // $FlowFixMe
  get loanPaymentAmount(): number {
    return this.numberFormat(this._loanPaymentAmount)
  }

  // $FlowFixMe
  set loanPaymentAmount(value: number) {
    if (typeof value === 'number') {
      if (value > this.nakedCarPrice) {
        this._loanPaymentAmount = this.nakedCarPrice
      } else if (value < 0) {
        this._loanPaymentAmount = 0
      } else {
        this._loanPaymentAmount = value
      }
    } else {
      this._loanPaymentAmount = 0
    }
  }

  /**
   * 贷款月利率
   *
   * @type {number}
   * @memberof Calculate
   */
  monthlyLoanPaymentRate: number = 0;

  /**
   * 贷款月支付金额
   *
   * @type {number}
   * @memberof Calculate
   */
  _monthlyLoanPaymentAmount: number = 0;

  // $FlowFixMe
  get monthlyLoanPaymentAmount(): number {
    return this.numberFormat(this._monthlyLoanPaymentAmount)
  }

  /**
   * 万元系数
   *
   * @type {number}
   * @memberof Calculate
   */
  tenThousandYuanRate: number = 0;

  /**
   * 贷款计算前提下，总共支付金额
   *
   * @type {number}
   * @memberof Calculate
   */
  _totalPaymentAmount: number = 0;

  // $FlowFixMe
  get totalPaymentAmount(): number {
    return this.numberFormat(this._totalPaymentAmount)
  }

  /**
   * 总利率金额
   *
   * @type {number}
   * @memberof Calculate
   */
  _totalInterestAmount: number = 0;

  // $FlowFixMe
  get totalInterestAmount(): number {
    return this.numberFormat(this._totalInterestAmount)
  }

  constructor() {
  }

  numberFormat(value: number): number {
    return Number(value.toFixed(0))
  }

  run() {
    // 正常计算
    this._downPaymentAmount = this.downPaymentAmountByLoan(this.nakedCarPrice, this.downPaymentRate)
    this._loanPaymentAmount = this.loanPaymentAmountByLoan(this.nakedCarPrice, this.downPaymentRate)
    this._monthlyLoanPaymentAmount = this.monthlyLoanPaymentAmountByLoan(this.nakedCarPrice, this.downPaymentRate, this.tenThousandYuanRate)
    this._totalInterestAmount = this.interestAmountOfLoanPayment(this.nakedCarPrice, this.downPaymentRate, this.monthlyLoanPaymentRate, this.stages)
    this._totalPaymentAmount = this.totalPaymentAmountByLoan(this.nakedCarPrice, this.downPaymentRate, this.monthlyLoanPaymentRate, this.stages)
  }

  percentageFrom(ratio: number): number {
    return Number((ratio * 100).toFixed(4))
  }

  rateFrom(percentage: number): number {
    return Number((percentage * 0.01).toFixed(6))
  }

  /**
   * 贷款月供计算公式 方式 2
   * 1.5以后没有费率了
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例, %
   * @param expenseRate   费率, %
   * @param stages        期数, 月数
   * @returns {number}    月供金额, 元
   */
  // monthlyLoanPaymentAmountByLoan2(
  //   nakedCarPrice: number,
  //   downPaymentRate: number,
  //   expenseRate: number,
  //   stages: number
  // ) {
  //   let loanPayment = this.loanPaymentAmountByLoan(nakedCarPrice, downPaymentRate, expenseRate)
  //   return (loanPayment / stages)
  // }

  /***
   * (贷款+利息)总额计算公式
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例，%
   * @param expenseRate   费率, %
   * @returns {number}    贷款总额，元
   */

  // loanPaymentAmountByLoan(
  //   nakedCarPrice: number,
  //   downPaymentRate: number,
  //   expenseRate: number
  // ) {
  //   return (nakedCarPrice * (100 - downPaymentRate) * 0.01 * (expenseRate * 0.01 + 1))
  // }

  /**
   * 首付计算公式
   *
   * @param {number} nakedCarPrice
   * @param {number} downPaymentRate
   * @returns {number}
   * @memberof Calculate
   */
  downPaymentAmountByLoan(
    nakedCarPrice: number,
    downPaymentRate: number
  ): number {
    if (this._downPaymentAmount !== 0) {
      return this._downPaymentAmount
    } else {
      return Number((nakedCarPrice * this.rateFrom(downPaymentRate)).toFixed(0))
    }
  }

  /***
   * (贷款)计算公式
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例，%
   * @returns {number}    贷款总额，元
   */
  loanPaymentAmountByLoan(
    nakedCarPrice: number,
    downPaymentRate: number
  ) {
    if (this._loanPaymentAmount !== 0) {
      return this._loanPaymentAmount
    } else {
      return nakedCarPrice - this.downPaymentAmountByLoan(nakedCarPrice, downPaymentRate)
    }
  }

  /**
   * （贷款的利息）总额计算公式
   *
   * @param carPrice      裸车价, 元
   * @param paymentRatio  首付比例，%
   * @param monthRate      月息（厘）
   * @param stages        期数, 月数
   *
   * @returns {number}    贷款利息总额
   */
  interestAmountOfLoanPayment(
    nakedCarPrice: number,
    downPaymentRate: number,
    monthlyLoanPaymentRate: number,
    stages: number
  ) {
    return this.loanPaymentAmountByLoan(nakedCarPrice, downPaymentRate) * stages * monthlyLoanPaymentRate * 0.001
  }

  /**
   * 月息转换为万元系数
   * 万元系数=10000/（贷款年数*12）+月息*10
   *
   * @param monthRate      月息（厘）
   * @param stages        期数, 年
   * @returns {number}    万元系数（元）
   */
  tenThousandYuanRateFrom(
    monthlyLoanPaymentRate: number,
    stages: number
  ): number {
    return ((10000 / stages + monthlyLoanPaymentRate * 10))
  }

  /**
   * 万元系数转换为月息
   * 月息 = (万元系数 - 10000 /（贷款年数 * 12)) / 10
   *
   * @param tenThousandYuanRatio      万元系数（元）
   * @param stages        期数, 年
   * @returns {number}    月息（厘）
   */
  monthlyLoanPaymentRateFrom(
    tenThousandYuanRatio: number,
    stages: number
  ): number {
    return ((tenThousandYuanRatio - 10000 / stages) / 10)
  }

  /**
 * 贷款月供计算公式 方式 1
 *
 * @param nakedCarPrice      裸车价, 元
 * @param downPaymentRatio  首付比例, %
 * @param tenThousandYuanRatio   万元系数, 元
 * @returns {number}    月供金额, 元
 */
  monthlyLoanPaymentAmountByLoan(
    nakedCarPrice: number,
    downPaymentRate: number,
    tenThousandYuanRatio: number
  ): number {
    const loanPayment = this.loanPaymentAmountByLoan(nakedCarPrice, downPaymentRate)
    const monthlyLoanPaymentAmount = (loanPayment / 10000 * tenThousandYuanRatio)
    return monthlyLoanPaymentAmount
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
  // totalPaymentAmountByLoan1(
  //   nakedCarPrice: number,
  //   downPaymentRate: number,
  //   expenseRate: number,
  //   stages: number,
  //   requiredExpenses: number,
  //   otherExpenses: number
  // ): number {
  //   let advancePaymentAmount = this.downPaymentAmountByLoan(nakedCarPrice, downPaymentRate, requiredExpenses, otherExpenses)
  //   let loanPaymentAmount = this.loanPaymentAmountByLoan(nakedCarPrice, downPaymentRate, expenseRate)
  //   return (advancePaymentAmount + loanPaymentAmount)
  // }

  /***
   * 贷款落地总额 计算公式
   *  1.贷款落地总额：全款落地总额+ 利息总额 +贷款手续费
   *  2.月供*期数+首付
   * @param carPrice          裸车价，元
   * @param paymentRatio      首付比例，%
   * @param monthRate         月息（厘）
   * @param stages            期数, 月数
   * @param requiredExpenses  必要花费
   * @param otherExpenses     其它花费（包含贷款手续费）
   * @returns {number}        总费用，元
   * @returns {number}        总费用，元
   */
  totalPaymentAmountByLoan(
    nakedCarPrice: number,
    downPaymentRate: number,
    monthlyLoanPaymentRate: number,
    stages: number
  ): number {
    let total = nakedCarPrice
    let interest = this.interestAmountOfLoanPayment(nakedCarPrice, downPaymentRate, monthlyLoanPaymentRate, stages)
    return total + interest
  }

  /**
   * 购置税
   * larry：购置税有一个逻辑需要加一下，排量1.6及以上的车型购置税不变，1.6（含）以下的购置税*0.75
   * 车价
   * 排量
   *
   * @static
   * @param {number} officialPrice
   * @param {number} capacity
   * @returns {number}
   * @memberof Util
   */
  purchaseTax(officialPrice: number, capacity: number): number {
    const tax = Number(officialPrice / 1.17 * 0.1)
    // if (capacity) {
    //   return (Number(capacity) > 1.6) ? tax : (tax * 0.75)
    // }
    return tax
  }
}
