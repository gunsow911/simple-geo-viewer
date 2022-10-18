import { useEffect, useMemo, useRef, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { PickingInfo, Layer } from '@deck.gl/core/typed';
import { Feature, Geometry } from 'geojson';
import { DashboardLayerProps } from '../../useDashboard';
import { DashboardAsset, UseMenuReturn } from '../DashboardAsset';
import { colorContinuous } from '@deck.gl/carto/typed';

export type LinkVolumeInfo = {
  selectedLinkId?: string;
  volumes: number[];
};

export type LinkVolumeProps = {
  linkId: string;
  max: number;
};

type LinkVolumeData = {
  [id: string]: number[];
};

type Props = {
  maxVolume?: number;
};

/**
 * リンク通行量フック
 */
const useLinkVolume = (props: Props): UseMenuReturn => {
  const [asset, setAsset] = useState<DashboardAsset<LinkVolumeInfo> | undefined>();
  const [data, setData] = useState<LinkVolumeData | undefined>();
  const assetRef = useRef<DashboardAsset<LinkVolumeInfo> | undefined>(undefined);
  assetRef.current = asset;
  const isLoading = asset === undefined;
  const menuId = 'link-volume';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maxVolume = useMemo<number>(() => props?.maxVolume ?? 100, []);

  useEffect(() => {
    const linkId = asset?.info.selectedLinkId;
    if (!linkId || !data || !assetRef.current) return;
    setAsset({
      ...assetRef.current,
      info: {
        ...assetRef.current.info,
        volumes: data[linkId],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.info.selectedLinkId]);

  // レイヤークリック時
  const onLayerClick = (pickingInfo: PickingInfo) => {
    const coordinate = pickingInfo.coordinate;
    if (!coordinate) return;
    if (!assetRef.current) return;

    const index = assetRef.current.layers.findIndex(
      (layer) => layer.props.id === 'link-volume-selected'
    );
    if (index === -1) return;

    const feature = pickingInfo.object as Feature<Geometry, LinkVolumeProps> | undefined;
    const selected = assetRef.current.layers[index].clone({
      data: feature as any,
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
        selectedLinkId: feature?.properties.linkId,
      },
    });
  };

  // ロード時
  const load = (): Layer<DashboardLayerProps>[] => {
    if (asset) return asset.layers;

    // 選択レイヤーを構築
    const selectedLayer = new GeoJsonLayer<Feature, DashboardLayerProps>({
      id: 'link-volume-selected',
      dashboardMenuId: menuId,
      data: undefined,
      visible: false,
      pickable: false,
      stroked: true,
      filled: true,
      lineWidthScale: 40,
      lineWidthMinPixels: 5,
      getLineColor: [0, 0, 255, 120],
    });

    // データをロード
    fetch('/dashboard/data/link-volume-data.jsonl')
      .then((data) => data.text())
      .then((t) => {
        const result = t
          .split('\n')
          .filter((json) => json.length > 0)
          .reduce<LinkVolumeData>((current, json) => {
            const v = JSON.parse(json) as { id: string; values: number[] };
            current[v.id] = v.values;
            return current;
          }, {});
        setData(result);
      });

    // ヒートマップをロード
    const loadedHeatmap = new GeoJsonLayer<Feature<Geometry, LinkVolumeProps>, DashboardLayerProps>(
      {
        id: 'link-volume-heatmap',
        dashboardMenuId: menuId,
        data: loadJsonl('/dashboard/data/link-volume-heatmap.jsonl'),
        visible: true,
        pickable: true,
        stroked: false,
        filled: true,
        lineWidthScale: 25,
        lineWidthMinPixels: 3,
        // @ts-ignore
        getLineColor: colorContinuous({
          attr: 'max',
          domain: [0, maxVolume],
          colors: [
            [0, 243, 255, 170],
            [255, 57, 0, 170],
          ],
        }),
        onClick: onLayerClick,
      }
    );
    return [loadedHeatmap, selectedLayer];
  };

  const loadJsonl = async (url: string) => {
    return await fetch(url)
      .then((data) => data.text())
      .then((t) => {
        return t
          .split('\n')
          .filter((json) => json.length > 0)
          .map<Feature<Geometry, LinkVolumeProps>>((json) => {
            return JSON.parse(json);
          });
      });
  };

  // メニューの表示
  const show = () => {
    const layers = asset ? asset.layers : load();

    const index = layers.findIndex((layer) => layer.id === 'link-volume-heatmap');
    const newLayer = layers[index].clone({
      visible: true,
    });

    setAsset({
      layers: [...layers.slice(0, index), newLayer, ...layers.slice(index + 1)],
      info: {
        selectedLinkId: undefined,
        volumes: [],
      },
    });
  };

  // メニューの非表示
  const hide = () => {
    const layers = asset?.layers;
    if (layers === undefined) {
      setAsset(undefined);
      return;
    }
    const hideLayers = layers.map((layer) => {
      return layer.clone({
        visible: false,
      });
    });
    setAsset({
      layers: hideLayers,
      info: {
        selectedLinkId: undefined,
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

export default useLinkVolume;
