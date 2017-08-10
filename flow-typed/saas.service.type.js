declare type CarModelSupplyChart = {
  scale: Array<string>,       // '1.30~1.02'
  x: Array<string>,           // '1.30~1.02'
  xAxisName: string,          // '下(万)'
  y: Array<number>,
};

declare type CarModelSupply = {
  chart: CarModelSupplyChart,
  colors: {[string]: string},                // 很奇怪的结构 {红: '#D7312B', 黑: 'EBC06A'}
  hours: Array<number>,
  status: string,             // '供货充足'
  supplierCount: number
};

declare type CarModelChart = {
  brandId: number,
  brandName: string,
  carModelId: number,
  carModelName: string,
  hot: number,
  officialPrice: number,
  officialPriceStr: string,
  supply: CarModelSupply,
  yearStyle: string
};

declare type PraiseModel = {
  praiseType: boolean,
  praiseLabel: string,
  praiseCount: number
};

declare type Filter = {
  items: Array<Item>
};

declare type Item = {
  name: string
};

declare type CarModelsResponse = {
  content: Array<CarModelChart>,
  praiseModels: Array<PraiseModel>,
  filters: Array<Filter>
};

declare type PriceTrendEntity = {
  priceDate: number,              // timestamp
  priceDateString: string,        // 'MM-DD'
  companyCount?: number,
  price?: number,
  guidePrice?: number,
  sortNum?: number,
  discount?: number
};

declare type SPUMarketTrendEntity = {
  lowestPriceTrend: Array<PriceTrendEntity>,
  maxPrice: number,
  minPrice: number,
  //priceTrendModels: Array<{ topNum: number, priceList: Array<PriceTrendEntity> }>
};
