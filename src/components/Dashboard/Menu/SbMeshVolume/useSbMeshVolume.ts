import { useEffect, useMemo, useRef, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { PickingInfo, Layer } from '@deck.gl/core/typed';
import { Feature } from 'geojson';
import { DashboardLayerProps } from '../../useDashboard';
import { DashboardAsset, UseMenuReturn } from '../DashboardAsset';
import { colorContinuous } from '@deck.gl/carto/typed';
import { japanmesh } from 'japanmesh';

export type SbMeshVolumeInfo = {
  selectedCode?: string;
  volumes: number[];
};

type SbMeshVolumeData = {
  [code: string]: number[];
};

type Props = {
  maxVolume?: number;
};

/**
 * ソフトバンクメッシュ人口フック
 */
const useSbMeshVolume = (props: Props): UseMenuReturn => {
  const [asset, setAsset] = useState<DashboardAsset<SbMeshVolumeInfo> | undefined>();
  const [data, setData] = useState<SbMeshVolumeData | undefined>();
  const assetRef = useRef<DashboardAsset<SbMeshVolumeInfo> | undefined>(undefined);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maxVolume = useMemo<number>(() => props?.maxVolume ?? 100, []);

  assetRef.current = asset;
  const isLoading = asset === undefined;
  const menuId = 'sb-mesh-volume';

  useEffect(() => {
    // 人口計算
    const code = asset?.info.selectedCode;
    if (!code || !data || !assetRef.current) return;
    const volumes = data[code] ?? [];

    setAsset({
      ...assetRef.current,
      info: {
        ...assetRef.current.info,
        volumes: volumes,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.info.selectedCode]);

  // レイヤークリック時
  const onLayerClick = (pickingInfo: PickingInfo) => {
    const coordinate = pickingInfo.coordinate;
    if (!coordinate) return;
    if (!assetRef.current) return;

    const index = assetRef.current.layers.findIndex(
      (layer) => layer.props.id === 'sb-mesh-volume-selected'
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
        ...assetRef.current.info,
        selectedCode: code,
      },
    });
  };

  // ロード時
  const load = (): Layer<DashboardLayerProps>[] => {
    if (asset) return asset.layers;

    // 選択レイヤーを構築
    const selectedLayer = new GeoJsonLayer<Feature, DashboardLayerProps>({
      id: 'sb-mesh-volume-selected',
      dashboardMenuId: menuId,
      data: undefined,
      visible: false,
      pickable: false,
      stroked: false,
      filled: true,
      getFillColor: [0, 0, 255, 120],
    });

    // データをロード
    fetch('/data/nanto/sb-mesh-volume-data.jsonl')
      .then((data) => data.text())
      .then((t) => {
        const result = t
          .split('\n')
          .filter((json) => json.length > 0)
          .reduce<SbMeshVolumeData>((current, json) => {
            const v = JSON.parse(json) as { code: string; values: number[] };
            current[v.code] = v.values;
            return current;
          }, {});
        setData(result);
      });

    // ヒートマップをロード
    const loadedHeatmap = new GeoJsonLayer<Feature, DashboardLayerProps>({
      id: 'sb-mesh-volume-heatmap',
      dashboardMenuId: menuId,
      data: '/data/nanto/sb-mesh-volume-heatmap.json',
      visible: true,
      pickable: true,
      stroked: false,
      filled: true,
      // @ts-ignore
      getFillColor: colorContinuous({
        attr: 'v',
        domain: [0, maxVolume],
        colors: [
          [0, 243, 255, 170],
          [255, 57, 0, 170],
        ],
      }),
      onClick: onLayerClick,
    });
    return [loadedHeatmap, selectedLayer];
  };

  // メニューの表示
  const show = () => {
    const layers = asset ? asset.layers : load();

    const index = layers.findIndex((layer) => layer.id === 'sb-mesh-volume-heatmap');
    const newLayer = layers[index].clone({
      visible: true,
    });

    setAsset({
      layers: [...layers.slice(0, index), newLayer, ...layers.slice(index + 1)],
      info: {
        selectedCode: undefined,
        volumes: [],
      },
    });
  };

  // メニューの非表示
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
        volumes: [],
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

export default useSbMeshVolume;