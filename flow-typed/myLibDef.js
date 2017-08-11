declare type ChartDataItem = {
  data: Array<string | number | null>,
  color: string | null,
  name: string | null,
  topno?: number | null,
  switch?: boolean,
  companyCount?: Array<number | null>,
  days: number | null
};
