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
  if (
    id === 'cn_business_household_susono' &&
    (typeof param === 'string' || typeof param === 'undefined')
  ) {
    return co2Business(param);
  }
  return [];
};
