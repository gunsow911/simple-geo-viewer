import chroma from 'chroma-js';

const gyoseiTokyo = (param?: string) => {
  return [
    {
      param: param === '千代田区',
      name: '千代田区',
      color: [255, 0, 0, 150],
    },
    {
      param: param !== '千代田区',
      name: 'その他',
      color: [100, 200, 255, 150],
    },
  ];
};

const shizuokaBuilding = (param?: string) => {
  const nParam = Number(param);
  const x = Math.floor(nParam / 1000);

  return [
    {
      param: param === '2019',
      name: '公共',
      color: [220, 220, 150, 180],
    },
    {
      param: param === '2020',
      name: '教育',
      color: [150, 220, 150, 180],
    },
    {
      param: x === 1,
      name: '住居系',
      color: [150, 150, 220, 180],
    },
    {
      param: x === 2,
      name: '事業所系',
      color: [0, 150, 220, 180],
    },
    {
      param: x !== 1 && x !== 2,
      name: '商業施設系',
      color: [220, 150, 150, 180],
    },
  ];
};

const co2Household = (param?: string) => {
  const colorScale = chroma.scale(['white', 'red']).domain([0, 8000]);

  return [
    {
      param: '',
      name: '0',
      color: colorScale(0).rgb(),
    },
    {
      param: '',
      name: '1000',
      color: colorScale(1000).rgb(),
    },
    {
      param: '',
      name: '2000',
      color: colorScale(2000).rgb(),
    },
    {
      param: '',
      name: '3000',
      color: colorScale(3000).rgb(),
    },
    {
      param: '',
      name: '4000',
      color: colorScale(4000).rgb(),
    },
    {
      param: '',
      name: '5000',
      color: colorScale(5000).rgb(),
    },
    {
      param: '',
      name: '6000',
      color: colorScale(6000).rgb(),
    },
    {
      param: '',
      name: '7000',
      color: colorScale(7000).rgb(),
    },
    {
      param: '',
      name: '8000',
      color: colorScale(8000).rgb(),
    },
  ];
};
const co2Business = (param?: string) => {
  const colorScale = chroma.scale(['white', 'red']).domain([0, 140000]);

  return [
    {
      param: '',
      name: '0',
      color: colorScale(0).rgb(),
    },
    {
      param: '',
      name: '20000',
      color: colorScale(20000).rgb(),
    },
    {
      param: '',
      name: '40000',
      color: colorScale(40000).rgb(),
    },
    {
      param: '',
      name: '60000',
      color: colorScale(60000).rgb(),
    },
    {
      param: '',
      name: '80000',
      color: colorScale(80000).rgb(),
    },
    {
      param: '',
      name: '100000',
      color: colorScale(100000).rgb(),
    },
    {
      param: '',
      name: '120000',
      color: colorScale(120000).rgb(),
    },
    {
      param: '',
      name: '140000',
      color: colorScale(140000).rgb(),
    },
  ];
};

export const getPlateauColorParamList = (param?: number) => {
  return [
    {
      param: param == 401,
      name: '業務施設',
      color: [255, 155, 0, 200],
    },
    {
      param: param == 402,
      name: '商業施設',
      color: [255, 0, 0, 200],
    },
    {
      param: param == 403,
      name: '宿泊施設',
      color: [230, 240, 40, 200],
    },
    {
      param: param == 404,
      name: '商業系複合施設',
      color: [255, 0, 0, 200],
    },
    {
      param: param == 411,
      name: '住宅',
      color: [50, 200, 10, 200],
    },
    {
      param: param == 412,
      name: '共同住宅',
      color: [140, 230, 40, 200],
    },
    {
      param: param == 413,
      name: '店舗併用住宅',
      color: [180, 220, 230, 200],
    },
    {
      param: param == 414,
      name: '店舗等併用共同住宅',
      color: [180, 220, 230, 200],
    },
    {
      param: param == 415,
      name: '作業所併用住宅',
      color: [180, 220, 230, 200],
    },
    {
      param: param == 421,
      name: '官公庁施設',
      color: [95, 150, 235, 200],
    },
    {
      param: param == 422,
      name: '文教厚生施設',
      color: [0, 0, 255, 200],
    },
    {
      param: param == 431,
      name: '運輸倉庫施設',
      color: [145, 95, 240, 200],
    },
    {
      param: param == 441,
      name: '工場',
      color: [125, 200, 250, 200],
    },
    {
      param: param == 451,
      name: '農林漁業用施設',
      color: [20, 120, 15, 200],
    },
    {
      param: param == 452,
      name: '供給処理施設',
      color: [40, 35, 125, 200],
    },
    {
      param: param == 453,
      name: '防衛施設',
      color: [160, 30, 10, 200],
    },
    {
      param: param == 454,
      name: 'その他',
      color: [230, 210, 220, 200],
    },
    {
      param: !param,
      name: '不明',
      color: [220, 220, 220, 200],
    },
  ];
};

export const getColorParamList = (id: string, param?: number | string) => {
  if (id === 'gyosei-tokyo' && (typeof param === 'string' || typeof param === 'undefined')) {
    return gyoseiTokyo(param);
  }
  if (id === 'shizuoka-building' && (typeof param === 'string' || typeof param === 'undefined')) {
    return shizuokaBuilding(param);
  }
  if (id === 'cn_household_susono' && (typeof param === 'string' || typeof param === 'undefined')) {
    return co2Household(param);
  }
  if (id === 'cn_business_susono' && (typeof param === 'string' || typeof param === 'undefined')) {
    return co2Business(param);
  }
  if (id === 'plateau-building' && (typeof param === 'number' || typeof param === 'undefined')) {
    return getPlateauColorParamList(param);
  }
  if (
    id === 'cn_business_household_susono' &&
    (typeof param === 'string' || typeof param === 'undefined')
  ) {
    return co2Business(param);
  }
  return [];
};
