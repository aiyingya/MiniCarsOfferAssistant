declare type Pagination<T> = {
  totalElements: number,
  totalPages: number,
  number: number,
  size: number,
  content: Array<T>,
  numberOfElements: number,
  hasNext: boolean,
  last: boolean,
  first: boolean,
  hasPrevious: boolean
}

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
  id: number,
  name: string,
  items: Array<Item>
};

declare type Item = {
  id: number,
  name: string,
  value: string,
  items: Array<Item>,
  selected: boolean
}

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
  lowestPriceTrend: Array<PriceTrendEntity>
};

declare type Company = {
  companyId: number,
  companyName: string,
  showLabel: string,
};

declare type Supplier = {
  supplierId: number,
  supplierName: string,
  supplierPhone: string
};

declare type Tag = {
  userId: string,
  label: string,
  createdDate: string
};

declare type UserComment = {
  commentId: number,
  companyId: number,
  tag: Array<Tag>, // 多个标签 ',' 号分割
  content: string,
  star: number,
  createdDate: string,
  userId: number,
  phone: string
};

declare type CarSKU = {
  externalColorName: string,
  internalColorName: string,

  viewModelTags?: Array<string>,
  viewModelLowestCarSource?: CarSource,
  viewModelQuoted?: PriceQuoted,
  viewModelSupplierSelfSupport?: boolean
};

// 货源详情
declare type CarSource = {
  id: string, // 车源 id
  publishDate: string,
  publishChannel: "",
  supplierSelfSupport: boolean,
  supplier: SupplierForCarSource,
  lowestPrice: number,
  externalColor: string,
  standardExternalColor: string,
  internalColor: string,
  contact: string,
  others: Array<CarSourcePlace> | null,
  lowest: CarSourcePlace | null,
  fastest: CarSourcePlace | null,

  viewModelTags?: Array<string>,
  viewModelTabs?: Array<{ name: string, value: CarSourcePlace }> | null,
  viewModelSelectedTab?: number,
  viewModelTabMore?: Array<CarSourcePlace> | null,
  viewModelSelectedCarSourcePlace?: CarSourcePlace,
  viewModelPublishDateDesc?: string,
  viewModelInternalColor?: string
};

declare type CarSourcePlace = {
  totalPrice: number,
  discount: number,
  priceFixed: boolean,
  logisticsFree: boolean,
  destinationList?: Array<Logistics>,

  viewModelSelectedLogisticsDestination?: Logistics | null,
  viewModelSelectedLogisticsDestinationIndex?: number,
  viewModelQuoted?: PriceQuoted,
  viewModelExpectedDeliveryDaysDesc?: string | null,
  viewModelEqualWithOfficialPrice?: boolean,
  viewModelTags?: Array<string>
};

declare type Logistics = {
  discount: number,
  totalPrice: number,
  expectedDeliveryDays: number,
  logisticsFee: number,

  viewModelLogisticsFeeDesc: string | null
};

declare type QuotedMethod = 'POINTS' | 'PRICE';

declare type PriceQuoted = {
  quotedMethod: QuotedMethod,
  quotedValue: number,
  quotedSymbol: 'DOWN' | 'PLUS' | 'NONE',
  quotedRange: number,
  quotedRangeUnit: string
};


declare type CarModel = {
  carModelId: number,
  carModelName: string,
  officialPrice: number,
  officialPriceStr: string
};

declare type SupplierForCarSource = {
  id: string,
  name: string,
  contact: string,
  companyId: number,
  companyName: string
};
