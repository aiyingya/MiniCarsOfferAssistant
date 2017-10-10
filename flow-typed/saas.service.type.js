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
};

declare type Brand = {
  brandId: string,
  brandName: string,
  brandLogoUrl: string
};

declare type Series = {
  seriesId: string,
  seriesName: string
};

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
  lowestPriceTrend: Array<PriceTrendEntity>
};

/// 供应商相关
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
  companyName: string,
  supplierType: 'IN' | 'PARTNER' | ''
};

declare type CompanyTag = {
  name: string,
  type: string
};

declare type CompanyTagInfo = {
  id: number,
  name: string,
  type: string,
  selected?: boolean // 在CarSourceComment里是空的
};

declare type CompanyRemark = {
  comment: string,
  price: number,
  mileage: Array<CompanyTagInfo>, //  公里数标签列表
  condition: Array<CompanyTagInfo>, // 特殊条件标签列表
  sourceArea: Array<CompanyTagInfo> // 货源地条件列表
};

declare type CarSourceComment = {
  id: number,
  price: number,
  content: string,
  userPhone: string,
  itemId: number,
  updateTime: string,
  tags: Array<CompanyTagInfo> // remove selected
};

// TODO v2.0 国庆节以后需要确认各字段的描述 和是否为空
// 供应商行情信息
// declare type CompanyMarket = {
  // spuSummary: Array<CompanyMarketSpuSummary>,
  // itemDetail: Array<CompanyMarketItemDetail>,
// };

declare type SpuSummary = {
  carModelId: number,
  carModelName: string,
  officialPrice: number,
  officialPriceStr: string,
  seatNums: Array<number>,
  capacity: number,
  electricCar: boolean
};

// declare type CompanyMarketItemDetail = {
//   companyId: number,            // 公司ID
//   companyName: string,          // 公司名称
//   companyType: string,          // 公司类型
//   simpleExteriorColor: string,  // 外饰颜色
//   simpleInteriorColor: string,  // 内饰颜色
//   salePrice: string,            // 售价
//   sourceRegion: string,         // 货源地
//   saleArea: string,             // 可售地区
//   publishTime: string,          // 发布时间戳
//   messageResultId: number       // 消息结果id
// };

// from api /search/car/spu
// TODO: v2.0 历史接口返回，现在加了模型，但是还没有注释，国庆后要补充滴~
declare type CarSpu = {
  totalElements: number,
  totalPages: number,
  number: number,
  size: number,
  content: Array<CarSpuContent>,
  first: boolean,
  last: boolean,
  numberOfElements: number,
  hasNext: boolean,
  hasPrevious: boolean
};

declare type CarSpuContent = {
  brandId: number, // 1358,
  brandName: string, // "上汽大众",
  yearStyle: string, // "2017款",
  carModelId: number, // 114080,
  carModelName: string, // "朗逸 2017款 1.6L 手动风尚版",
  officialPrice: number,
  officialPriceStr: string, // "1099",
  pic: string, // "http://produce.oss-cn-hangzhou.aliyuncs.com/ops/upload/image/original/20151210/668b7c25-7dab-49d7-a345-00390f4109f1.jpg",
  hot: number, // 80,
  supply : CarSpuContentSupply
};

declare type CarSpuContentSupply = {
  supplierCount: number,
  colors: {
    黑: string, // "#000000",
    白: string, // "#FFFFFF"
  },
  hours: Array<number>,
  status: number, // "供货充足",
  chart: {
    x: Array<string>,
    y: Array<number>,
    scale: Array<string>,
    xAxisName: string
  }
};

/// 公司相关
declare type CompanyType = 'IN' | 'PARTNER' | 'SUPPLIER';

declare type Company = {
  companyId: number,
  companyName: string,
  companyType: CompanyType,
  showLabel: string | null,
  mainBrand: Array<Brand>,
  mainSeries: Array<Series>
};

/// 车辆行情相关

// 按照 SKU 来聚合的车辆货源商品集合
declare type CarSourceItemsBySKU = {
  title: string,
  lowestSalePrice: number,
  count: number,
  itemDetails: Array<CarSourceItem>
};

// 车辆货源商品实体
declare type CarSourceItem = {
  id: number,
  companyId: string,
  companyName: string,
  companyType: CompanyType,
  simpleExteriorColor: string,
  simpleInteriorColor: string,
  sourceRegion: string,
  salePrice: number,
  saleArea: string,
  publishTime: string,
  exteriorColor: string
};
