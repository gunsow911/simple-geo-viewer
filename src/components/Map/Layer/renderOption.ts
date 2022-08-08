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

const susonoBuilding = (layer: any) => {
  const getFillColor = (d: any) => {
    if('建物分類' in d.properties) {

      getColorParam(layer.id, d.properties['建物分類']);
      if(d.properties['建物分類'] === 9999) {
        // その他
        return [150, 150, 150, 150];
      }
      else if(d.properties['建物分類'] < 0) {
        // NULL
        return [255, 255, 255, 150];
      }
      else {
        // 公共2019, 教育2020
        const bldg_class = d.properties['建物分類'];
        if (bldg_class === 2019) {
          return [220, 220, 150, 180]
        }
        else if (bldg_class === 2020)  {
          return [150, 220, 220, 180]
        }
        else {
          // 住居系:100x、事業所系：20xx、商業施設系：300x
          const x = Math.floor(bldg_class / 1000);
          if (x === 1) {
            return [150, 150, 220, 180]
          }
          else if (x === 2) {
            return [150, 220, 150, 180]
          }
          else {
            return [220, 150, 150, 180]
          }
        }
      }
    } else {
      return [200, 200, 200, 200];
    }
  }
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

export const addRenderOption = (layers: any[]) => {
  const addedPropsLayers: any[] = [];

  for (const layer of layers) {
    if (layer.id === 'gyosei-tokyo') {
      const newLayer: any = gyoseiTokyo(layer);
      addedPropsLayers.push(newLayer);
      continue;
    }

    if (layer.id === 'shizuoka-building') {
      const newLayer: any = susonoBuilding(layer);
      addedPropsLayers.push(newLayer);
      continue;
    }
    //条件に一致しなければlayerに変更を加えずに配列に追加
    addedPropsLayers.push(layer);
  }

  return addedPropsLayers;
};
