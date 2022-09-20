import { getColorParamList } from '@/components/Map/Legend/colorParamList';

const getColorParam = (id: string, param: number | string) => {
  const colorParamList = getColorParamList(id, param);
  const colorParam = colorParamList.find((colorParam) => colorParam.param);
  return colorParam?.color;
};

const gyoseiTokyo = (layer: any) => {
  const getFillColor = (d: any) => getColorParam(layer.id, d.properties['N03_004']);

  return layer.clone({
    getFillColor,
  });
};

const getBuildingElevation = (d: any) => {
  var vals = ['bui_floor', 'floor', '階数', '建物の階数', 'height'];
  var floor = 'none';
  for (const val of vals) {
    floor = val in d.properties ? val : floor;
  }
  if (floor == 'none') return 0;
  return floor in d.properties ? (d.properties[floor] === 0 ? 2 : d.properties[floor]) * 3 : 2 * 3;
};

const susonoBuilding = (layer: any) => {
  const getFillColor = (d: any) => {
    //Platue
    if ('用途' in d.properties) {
      const usage = d.properties['用途'];
      const x = Math.floor(usage / 10);

      if (usage === 461) {
        //不明
        return [180, 200, 210, 230];
      } else if (usage === 454) {
        //その他
        return [180, 200, 210, 180];
      } else if (usage === 421 || usage === 453) {
        // 官公庁、防衛
        return [80, 150, 220, 180];
      } else if (usage === 422) {
        // 文教
        return [80, 120, 240, 180];
      } else if (usage === 431 || usage === 441 || usage === 451 || usage === 452) {
        // 運輸倉庫、工場、農林漁業、供給施設
        return [180, 200, 240, 180];
      }

      if (x === 40) {
        // 商業系
        return [220, 150, 80, 150];
      } else if (x === 41) {
        // 住宅系
        return [140, 250, 120, 150];
      }
    }

    //ゼンリン
    if ('建物分類' in d.properties) {
      getColorParam(layer.id, d.properties['建物分類']);
      if (d.properties['建物分類'] === 9999) {
        // その他
        return [150, 150, 150, 150];
      } else if (d.properties['建物分類'] < 0) {
        // NULL
        return [255, 255, 255, 150];
      } else {
        // 公共2019, 教育2020
        const bldg_class = d.properties['建物分類'];
        if (bldg_class === 2019) {
          return [220, 220, 150, 180];
        } else if (bldg_class === 2020) {
          return [150, 220, 220, 180];
        } else {
          // 住居系:100x、事業所系：20xx、商業施設系：300x
          const x = Math.floor(bldg_class / 1000);
          if (x === 1) {
            return [150, 150, 220, 180];
          } else if (x === 2) {
            return [150, 220, 150, 180];
          } else {
            return [220, 150, 150, 180];
          }
        }
      }
    } else {
      return [200, 200, 200, 200];
    }
  };
  const getLineColor = () => [200, 200, 200, 200];
  const getElevation = (d: any) => {
    if ('bui_floor' in d.properties) {
      if (d.properties.bui_floor === 0) {
        return 2 * 3;
      } else {
        return d.properties.bui_floor * 3;
      }
    }
    return 2 * 3;
  };

  return layer.clone({
    extruded: true,
    getFillColor,
    getLineColor,
    getElevation,
  });
};

const zenrinBuilding = (layer: any) => {
  const getFillColor = () => [200, 200, 200, 200];
  const getLineColor = () => [200, 200, 200, 200];
  const getElevation = (d: any) => {
    return getBuildingElevation(d);
  };

  return layer.clone({
    extruded: true,
    getFillColor,
    getLineColor,
    getElevation,
  });
};

export const addRenderOption = (layers: any[]) => {
  const addedPropsLayers: any[] = [];
  const colorBuildIDs = [
    'shizuoka-building',
    '37201',
    '37202',
    '37203',
    '37204',
    '37205',
    '37206',
    '37207',
    '37208',
    '22213',
    '22213_plateau',
    '44201',
    '12101',
    '12102',
    '12103',
    '12104',
    '12105',
    '12106',
  ];
  const zenrinIDs = [
    'zenrin-building',
    'tokyo-building',
    'zenrin-building1',
    'zenrin-building2',
    'zenrin-building3',
    'zenrin-building4',
    'zenrin-building5',
    'zenrin-building6',
  ];

  for (const layer of layers) {
    if (layer.id === 'gyosei-tokyo') {
      const newLayer: any = gyoseiTokyo(layer);
      addedPropsLayers.push(newLayer);
      continue;
    }

    if (colorBuildIDs.includes(layer.id)) {
      const newLayer: any = susonoBuilding(layer);
      addedPropsLayers.push(newLayer);
      continue;
    }

    if (zenrinIDs.includes(layer.id)) {
      const newLayer: any = zenrinBuilding(layer);
      addedPropsLayers.push(newLayer);
      continue;
    }

    //条件に一致しなければlayerに変更を加えずに配列に追加
    addedPropsLayers.push(layer);
  }

  return addedPropsLayers;
};
