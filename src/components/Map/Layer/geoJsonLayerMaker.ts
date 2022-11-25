import { PickInfo } from 'deck.gl';
import { GeoJsonLayer } from '@deck.gl/layers';

import { show } from '@/components/Tooltip/show';
import { Dispatch, SetStateAction } from 'react';

import {
  GeojsonIconLayerConfig,
  GeojsonLayerConfig,
  LayerConfig,
} from '@/components/LayerFilter/config';

/**
 * GeoJsonLayerの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeGeoJsonLayer(layerConfig: LayerConfig, setTooltipData, setsetTooltipPosition) {
  const geoJsonLinePolygonCreator = new GeoJsonLinePolygonCreator(
    layerConfig,
    setTooltipData,
    setsetTooltipPosition
  );
  const geoJsonIconCreator = new GeoJsonIconLayerCreator(
    layerConfig,
    setTooltipData,
    setsetTooltipPosition
  );
  const geoJsonFeatureCollectionIconCreator = new GeoJsonFeatureCollectionIconLayerCreator(
    layerConfig,
    setTooltipData,
    setsetTooltipPosition
  );
  const geoJsonLinePolygonLayer = geoJsonLinePolygonCreator.makeDeckGlLayer();
  const geoJsonIconLayer = geoJsonIconCreator.makeDeckGlLayer();
  const geoJsonFeatureCollectionIconLayer = geoJsonFeatureCollectionIconCreator.makeDeckGlLayer();
  return geoJsonLinePolygonLayer ?? geoJsonIconLayer ?? geoJsonFeatureCollectionIconLayer;
}

class GeoJsonLinePolygonCreator {
  layerType: string = 'geojson';
  private readonly layerConfig: LayerConfig;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);

      return new GeoJsonLayer({
        data: layerConfig.source,
        visible: true,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        getFillColor: (d: any) => d.properties?.fillColor || [0, 0, 0, 255],
        ...config,
      });
    }
    return null;
  }

  private extractLayerConfig = (layerConfig: GeojsonLayerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  private isTargetConfig(layerConfig: LayerConfig): layerConfig is GeojsonLayerConfig {
    return layerConfig.type === this.layerType;
  }

  showToolTip = (info: PickInfo<any>) => {
    const { coordinate, object } = info;
    if (!coordinate) return;
    if (!object) return;
    // @ts-ignore
    const {
      layer: {
        props: { tooltipType },
      },
    } = info;
    const {
      layer: { id },
    } = info;

    const parent = document.getElementById('MapArea');
    const body = document.getElementsByTagName('body')[0];
    const tooltipWidth = body.clientWidth * 0.25;
    const tooltipHeight = body.clientHeight * 0.25;
    const parentWidth = parent !== null ? parent.clientWidth : 10;
    const parentHeight = parent !== null ? parent.clientHeight : 10;

    let x = info.x;
    let y = info.y;

    if (x + tooltipWidth + 40 > parentWidth) {
      x = parentWidth - tooltipWidth - 40;
    }

    if (y + tooltipHeight + 300 > parentHeight) {
      y = parentHeight - tooltipHeight - 300;
    }
    this.setsetTooltipPosition({
      top: `${String(y)}px`,
      left: `${String(x)}px`,
    });
    /* TODO Tooltipをrecoilベースに変更する
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);

     */
  };
}

class GeoJsonIconLayerCreator {
  layerType: string = 'geojsonicon';
  private readonly layerConfig: LayerConfig;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);

      return new GeoJsonLayer({
        data: layerConfig.source,
        visible: true,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        pointType: 'icon',
        getIcon: (_) => ({
          url: layerConfig.icon.url,
          width: layerConfig.icon.width,
          height: layerConfig.icon.height,
          anchorY: layerConfig.icon.anchorY,
          mask: false,
        }),
        parameters: {
          depthTest: false,
        },
        ...config,
      });
    }

    return null;
  }

  extractLayerConfig = (layerConfig: GeojsonIconLayerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  isTargetConfig(layerConfig: LayerConfig): layerConfig is GeojsonIconLayerConfig {
    return layerConfig.type === this.layerType;
  }

  showToolTip = (info: PickInfo<any>) => {
    const { coordinate, object } = info;
    if (!coordinate) return;
    if (!object) return;
    // @ts-ignore
    const {
      layer: {
        props: { tooltipType },
      },
    } = info;
    const {
      layer: { id },
    } = info;

    const parent = document.getElementById('MapArea');
    const body = document.getElementsByTagName('body')[0];
    const tooltipWidth = body.clientWidth * 0.25;
    const tooltipHeight = body.clientHeight * 0.25;
    const parentWidth = parent !== null ? parent.clientWidth : 10;
    const parentHeight = parent !== null ? parent.clientHeight : 10;

    let x = info.x;
    let y = info.y;

    if (x + tooltipWidth + 40 > parentWidth) {
      x = parentWidth - tooltipWidth - 40;
    }

    if (y + tooltipHeight + 300 > parentHeight) {
      y = parentHeight - tooltipHeight - 300;
    }
    this.setsetTooltipPosition({
      top: `${String(y)}px`,
      left: `${String(x)}px`,
    });
    /* TODO Tooltipをrecoilベースに変更する
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);

     */
  };
}

/**
 * JSON形式のfeatureCollectionの取得
 * @param url JSONのURL
 * @param filterFunc featureを一括で処理する関数(例:要素名を変える)
 */
async function getJsonFeatures(
  url: string,
  filterFunc: (any) => any = (_) => {
    return _;
  }
): Promise<any> {
  const respons = await fetch(url);
  const jsonData = await respons.json();
  const features = jsonData.map(filterFunc);
  return features;
}

class GeoJsonFeatureCollectionIconLayerCreator {
  layerType: string = 'geojsonfcicon';
  private readonly layerConfig: LayerConfig;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);
      let features: any;
      // aedレイヤーは要素名が日本語や座標の値が特殊なため修正する関数を定義
      if (layerConfig.id == 'susono-aed') {
        const aedFiler = (feature) => {
          return {
            type: feature['種類'],
            properties: feature['properties'],
            geometry: {
              type: feature['geometry']['種類'],
              coordinates: feature['geometry']['coordinates'].slice(0, 2),
            },
          };
        };
        features = getJsonFeatures(layerConfig.source, aedFiler);
      } else {
        features = getJsonFeatures(layerConfig.source);
      }

      return new GeoJsonLayer({
        data: features,
        visible: true,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        pointType: 'icon',
        getIcon: (_) => ({
          url: layerConfig.icon.url,
          width: layerConfig.icon.width,
          height: layerConfig.icon.height,
          anchorY: layerConfig.icon.anchorY,
          mask: false,
        }),
        ...config,
      });
    }
    return null;
  }

  extractLayerConfig = (layerConfig: GeojsonIconLayerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  isTargetConfig(layerConfig: LayerConfig): layerConfig is GeojsonIconLayerConfig {
    return layerConfig.type === this.layerType;
  }

  showToolTip = (info: PickInfo<any>) => {
    const { coordinate, object } = info;
    if (!coordinate) return;
    if (!object) return;
    // @ts-ignore
    const {
      layer: {
        props: { tooltipType },
      },
    } = info;
    const {
      layer: { id },
    } = info;

    const parent = document.getElementById('MapArea');
    const body = document.getElementsByTagName('body')[0];
    const tooltipWidth = body.clientWidth * 0.25;
    const tooltipHeight = body.clientHeight * 0.25;
    const parentWidth = parent !== null ? parent.clientWidth : 10;
    const parentHeight = parent !== null ? parent.clientHeight : 10;

    let x = info.x;
    let y = info.y;

    if (x + tooltipWidth + 40 > parentWidth) {
      x = parentWidth - tooltipWidth - 40;
    }

    if (y + tooltipHeight + 300 > parentHeight) {
      y = parentHeight - tooltipHeight - 300;
    }
    this.setsetTooltipPosition({
      top: `${String(y)}px`,
      left: `${String(x)}px`,
    });
    /*
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);

     */
  };
}
