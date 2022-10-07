import { Dispatch, useRef, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { PickingInfo, Layer } from '@deck.gl/core/typed';
import { Feature } from 'geojson';
import { DashboardLayerProps } from '../../useDashboard';
import { DashboardAsset, UseMenuReturn } from '../DashboardAsset';
import { colorContinuous } from '@deck.gl/carto/typed';
import { japanmesh } from 'japanmesh';

type DateSelectList = {
  [key: string]: string;
};

export type TuMeshVolumeInfo = {
  selectedCode?: string;
  dateSelectList: DateSelectList;
  selectedDate: string;
  setSelectedDate: Dispatch<string>;
};

/**
 * 東京大学メッシュ人口フック
 */
const useTuMeshVolume = (): UseMenuReturn => {
  const [asset, setAsset] = useState<DashboardAsset<TuMeshVolumeInfo> | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('2019-10-13');
  const assetRef = useRef<DashboardAsset<TuMeshVolumeInfo> | undefined>(undefined);
  assetRef.current = asset;
  const isLoading = asset === undefined;
  const menuId = 'tu-mesh-volume';

  const dateSelectList: DateSelectList = {
    '2019-10-13': '2019年10月13日(月)',
    '2019-10-14': '2019年10月14日(火)',
    '2019-10-15': '2019年10月15日(水)',
    '2019-10-16': '2019年10月16日(木)',
    '2019-10-17': '2019年10月17日(金)',
    '2019-10-18': '2019年10月18日(土)',
    '2019-10-19': '2019年10月19日(日)',
    '2020-10-11': '2020年10月11日(日)',
    '2020-10-12': '2020年10月12日(月)',
    '2020-10-13': '2020年10月13日(火)',
    '2020-10-14': '2020年10月14日(水)',
    '2020-10-15': '2020年10月15日(木)',
    '2020-10-16': '2020年10月16日(金)',
    '2020-10-17': '2020年10月17日(土)',
  };

  // レイヤークリック時
  const onLayerClick = (pickingInfo: PickingInfo) => {
    const coordinate = pickingInfo.coordinate;
    if (!coordinate) return;
    if (!assetRef.current) return;

    const index = assetRef.current.layers.findIndex(
      (layer) => layer.props.id === 'tu-mesh-volume-selected'
    );
    if (index === -1) return;

    const code = japanmesh.toCode(coordinate[1], coordinate[0], 500);
    const meshData = JSON.stringify(japanmesh.toGeoJSON(code));
    const selected = assetRef.current.layers[index].clone({
      data: JSON.parse(meshData),
      visible: true,
    });
    setAsset({
      ...assetRef.current,
      layers: [
        ...assetRef.current.layers.slice(0, index),
        selected,
        ...assetRef.current.layers.slice(index + 1),
      ],
      info: {
        selectedCode: code,
        dateSelectList,
        selectedDate,
        setSelectedDate,
      },
    });
  };

  // ロード時
  const load = (): Layer<DashboardLayerProps>[] => {
    if (asset) return asset.layers;
    const selectedLayer = new GeoJsonLayer<Feature, DashboardLayerProps>({
      id: 'tu-mesh-volume-selected',
      dashboardMenuId: menuId,
      data: undefined,
      visible: false,
      pickable: false,
      stroked: false,
      filled: true,
      getFillColor: [0, 0, 255, 120],
    });

    const loadedHeatmap = new GeoJsonLayer<Feature, DashboardLayerProps>({
      id: 'tu-mesh-volume-heatmap',
      dashboardMenuId: menuId,
      data: '/data/nanto/tu-mesh-volume.json',
      visible: true,
      pickable: true,
      stroked: false,
      filled: true,
      // @ts-ignore
      getFillColor: colorContinuous({
        attr: 'v',
        domain: [0, 40],
        colors: [
          [0, 243, 255, 170],
          [255, 57, 0, 170],
        ],
      }),
      onClick: onLayerClick,
    });
    return [loadedHeatmap, selectedLayer];
  };

  const show = () => {
    const layers = asset ? asset.layers : load();

    const index = layers.findIndex((layer) => layer.id === 'tu-mesh-volume-heatmap');
    const newLayer = layers[index].clone({
      visible: true,
    });

    setAsset({
      layers: [...layers.slice(0, index), newLayer, ...layers.slice(index + 1)],
      info: {
        selectedCode: undefined,
        dateSelectList,
        selectedDate,
        setSelectedDate,
      },
    });
  };

  const hide = () => {
    const layers = asset ? asset.layers : load();
    const hideLayers = layers.map((layer) => {
      return layer.clone({
        visible: false,
      });
    });
    setAsset({
      layers: hideLayers,
      info: {
        selectedCode: undefined,
        dateSelectList,
        selectedDate,
        setSelectedDate,
      },
    });
  };

  return {
    menuId,
    asset,
    show,
    hide,
    isLoading,
  };
};

export default useTuMeshVolume;
