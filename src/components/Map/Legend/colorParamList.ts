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
      name: '公共2019',
      color: [220, 220, 150, 180],
    },
    {
      param: param === '2020',
      name: '教育2020',
      color: [150, 220, 150, 180],
    },
    {
      param: x === 1,
      name: '住居系',
      color: [150, 150, 220, 180],
    },
    {
      param: x === 2,
      name: '事務所系',
      color: [150, 220, 150, 180],
    },
    {
      param: x !== 1 && x!== 2,
      name: '商業施設系',
      color: [220, 150, 150, 180],
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
  return [];
};
