import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { PickingInfo, Layer } from '@deck.gl/core/typed';
import { Feature } from 'geojson';
import { DashboardLayerProps } from '../../useDashboard';
import { DashboardAsset, UseMenuReturn } from '../DashboardAsset';
import { colorContinuous } from '@deck.gl/carto/typed';
import { japanmesh } from 'japanmesh';

export type TuMeshVolumeInfo = {
  selectedCode?: string;
  setDate: (value: string) => void;
};

/**
 * 東京大学メッシュ人口フック
 */
const useTuMeshVolume = (): UseMenuReturn => {
  const [asset, setAsset] = useState<DashboardAsset<TuMeshVolumeInfo> | undefined>();
  const assetRef = useRef<DashboardAsset<TuMeshVolumeInfo> | undefined>(undefined);
  assetRef.current = asset;
  const isLoading = asset === undefined;
  const menuId = 'tu-mesh-volume';

  // 日付変更時
  const setDate = (value: string) => {
    console.log(value);
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
        setDate,
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
        setDate,
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
        setDate,
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
