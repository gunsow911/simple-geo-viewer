import type { Map } from 'maplibre-gl';
import { CompositeLayer, PickInfo } from 'deck.gl';
import { GeoJsonLayer, IconLayer, TextLayer } from '@deck.gl/layers';

import { show } from '@/components/Tooltip/show';
import { Dispatch, SetStateAction } from 'react';

import {
  GeojsonIconLayerConfig,
  GeojsonLayerConfig,
  LayerConfig,
} from '@/components/LayerFilter/config';
import { BooleanFlag } from 'aws-sdk/clients/directconnect';
import { Config } from 'aws-sdk';

/**
 * GeoJsonLayerの作成
 * @param map mapインスタンス
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param init 初期表示レイヤー生成かどうか
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeGeoJsonLayers(
  map: Map,
  layerConfig: LayerConfig[],
  init: boolean,
  setTooltipData,
  setsetTooltipPosition
) {
  const geoJsonLinePolygonCreator = new GeoJsonLinePolygonCreator(
    layerConfig,
    map,
    setTooltipData,
    setsetTooltipPosition
  );
  const geoJsonIconCreator = new GeoJsonIconLayerCreator(
    layerConfig,
    map,
    setTooltipData,
    setsetTooltipPosition
  );
  const geoJsoneatureCollectionIconCreator = new GeoJsonFeatureCollectionIconLayerCreator(
    layerConfig,
    map,
    setTooltipData,
    setsetTooltipPosition
  );
  const geoJsoneatureCollectionArrowCreator = new GeoJsonArrowLayerCreator(
    layerConfig,
    map,
    setTooltipData,
    setsetTooltipPosition
  );
  const layers = [
    ...geoJsonLinePolygonCreator.makeDeckGlLayers(init),
    ...geoJsonIconCreator.makeDeckGlLayers(init),
    ...geoJsoneatureCollectionIconCreator.makeDeckGlLayers(init),
    ...geoJsoneatureCollectionArrowCreator.makeDeckGlLayers(init),
  ];
  return layers;
}

class GeoJsonLinePolygonCreator {
  layersType: string = 'geojson';
  private readonly layerConfig: LayerConfig[];
  private readonly map: Map;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig[], map: Map, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.map = map;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayers(init) {
    const targetLayerConfigs = this.extractTargetConfig();

    const result: GeoJsonLayer<any>[] = targetLayerConfigs.map((layerConfig) => {
      const config = this.extractLayerConfig(layerConfig);

      return new GeoJsonLayer({
        data: layerConfig.source,
        visible: init,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        getFillColor: (d: any) => d.properties?.fillColor || [0, 0, 0, 255],
        ...config,
      });
    });

    return result;
  }

  extractLayerConfig = (layerConfig: GeojsonLayerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  extractTargetConfig() {
    return this.layerConfig.filter((layerConfig: LayerConfig) => {
      return layerConfig.type === this.layersType;
    }) as GeojsonLayerConfig[];
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
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);
  };
}

class GeoJsonIconLayerCreator {
  layersType: string = 'geojsonicon';
  private readonly layerConfig: LayerConfig[];
  private readonly map: Map;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig[], map: Map, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.map = map;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayers(init) {
    const targetLayerConfigs = this.extractTargetConfig();

    const result: GeoJsonLayer<any>[] = targetLayerConfigs.map((layerConfig) => {
      const config = this.extractLayerConfig(layerConfig);

      return new GeoJsonLayer({
        data: layerConfig.source,
        visible: init,
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
    });

    return result;
  }

  extractLayerConfig = (layerConfig: GeojsonIconLayerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  extractTargetConfig() {
    return this.layerConfig.filter((layerConfig: LayerConfig) => {
      return layerConfig.type === this.layersType;
    }) as GeojsonIconLayerConfig[];
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
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);
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
  layersType: string = 'geojsonfcicon';
  private readonly layerConfig: LayerConfig[];
  private readonly map: Map;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig[], map: Map, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.map = map;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayers(init) {
    const targetLayerConfigs = this.extractTargetConfig();

    const result: GeoJsonLayer<any>[] = targetLayerConfigs.map((layerConfig) => {
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
        visible: init,
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
    });

    return result;
  }

  extractLayerConfig = (layerConfig: GeojsonIconLayerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  extractTargetConfig() {
    return this.layerConfig.filter((layerConfig: LayerConfig) => {
      return layerConfig.type === this.layersType;
    }) as GeojsonIconLayerConfig[];
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
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);
  };
}

interface GeoJsonArrowLayerProps{
  url: string;
}

export default class GeoJsonArrowLayer extends CompositeLayer<GeoJsonArrowLayerProps> {
  // constructor(props: any) {
  //   super(props);
  // }

  // initializeState() {
  //   const { init }  = this.props;
  //   const data = this.props.layerConfig.source;
  //   this.setState({data: data, init: init})
  // }

  degreesToAnchorPer(degrees,x,y) {
    const pi: number = Math.PI;
    const round = 1000000000000;
    const radian:number = degrees * (pi / 180);
    const cos:number = Math.floor((Math.cos(radian) * round)) / round;
    const sin:number = Math.floor((Math.sin(radian) * round)) / round;
    //画像の配置の仕様
    const anchor :any = {x:((1-sin)*0.5)*x, y:((1+cos)*0.5)*y};
    return {...anchor};
  }

  renderLayers() {
    console.log("render")
    const { id, visible, url } = this.props
    return [
      new GeoJsonLayer({
        data: url,
        id: id + 'point',
        visible: visible,
        pickable: true,
        autoHighlight: true,
        sizeScale: 8,
        // @ts-ignore
        iconSizeScale: 60,
        pointType: 'icon',
        getIcon: (_) => ({
          url: 'images/icon.png',
          width: this.props.icon.width,
          height: this.props.icon.height,
          anchorY: this.props.icon.anchorY,
          mask: false,
        }),
        parameters: {
          depthTest: false,
        },
      }),
      new GeoJsonLayer({
        data: url,
        id: id + 'arrow',
        visible: visible,
        pickable: true,
        autoHighlight: true,
        sizeScale: 8,
        // @ts-ignore
        iconSizeScale: 60,
        pointType: 'icon',
        getIcon: (_) => {
          const angle: number = ("方向" in _.properties ? (_.properties.方向 === null ? 0 : _.properties.方向) : 0);
          const anchor: any = this.degreesToAnchorPer(angle,64,64); 
    
          console.log("icon:"+_.properties["タイトル"]+":"+angle);
          return ({
          url: 'images/arrow.png',
          width: this.props.icon.width * angle,
          height: this.props.icon.height * angle,
          anchorX: anchor.x,
          anchorY: anchor.y,
          mask: false,
          })
      },
        parameters: {
          depthTest: false,
        },
        getIconAngle: (d) => {
          const angle = "方向" in d.properties ? (d.properties.方向 === null ? 0 : d.properties.方向) : 0;
          // const angle = 345.57;
          console.log("arr:"+d.properties["タイトル"]+":"+angle);
          return angle
        },
        updateTriggers: {
          getIcon: this.props.updateTriggers.getIcon,
        }
      }),
    ];
  }
}

class GeoJsonArrowLayerCreator {
  layersType: string = 'geojsonarrow';
  private readonly layerConfig: LayerConfig[];
  private readonly map: Map;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: LayerConfig[], map: Map, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.map = map;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayers(init) {
    const targetLayerConfigs = this.extractTargetConfig();

    const result: GeoJsonArrowLayer[] = targetLayerConfigs.map((layerConfig) => {
      const config = this.extractLayerConfig(layerConfig);
      return new GeoJsonArrowLayer({
        url: layerConfig.source,
        visible: init,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        sizeScale: 8,
        // @ts-ignore
        iconSizeScale: 60,
        pointType: 'icon',
        ...config,
      });
    });

    return result;
  }

  extractLayerConfig = (layerConfig: GeojsonIconLayerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  extractTargetConfig() {
    return this.layerConfig.filter((layerConfig: LayerConfig) => {
      return layerConfig.type === this.layersType;
    }) as GeojsonIconLayerConfig[];
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
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);
  };
}
