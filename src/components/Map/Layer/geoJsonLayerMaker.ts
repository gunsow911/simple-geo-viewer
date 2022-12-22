import { PickInfo } from 'deck.gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import { CompositeLayer,CompositeLayerProps } from "@deck.gl/core/typed";


import {
  GeojsonIconLayerConfig,
  GeojsonLayerConfig,
  LayerConfig,
} from '@/components/LayerFilter/config';
import { SetterOrUpdater } from 'recoil';
import { showToolTip } from '@/components/Tooltip/show';

/**
 * GeoJsonLayerの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeGeoJsonLayer(layerConfig: LayerConfig, setTooltipData, setTooltipPosition) {
  const geoJsonLinePolygonCreator = new GeoJsonLinePolygonCreator(
    layerConfig,
    setTooltipData,
    setTooltipPosition
  );
  const geoJsonIconCreator = new GeoJsonIconLayerCreator(
    layerConfig,
    setTooltipData,
    setTooltipPosition
  );
  const geoJsonFeatureCollectionIconCreator = new GeoJsonFeatureCollectionIconLayerCreator(
    layerConfig,
    setTooltipData,
    setTooltipPosition
  );

  const geoJsonArrowCreator = new GeoJsonArrowLayerCreator(
    layerConfig,
    setTooltipData,
    setTooltipPosition
  );

  const geoJsonLinePolygonLayer = geoJsonLinePolygonCreator.makeDeckGlLayer();
  const geoJsonIconLayer = geoJsonIconCreator.makeDeckGlLayer();
  const geoJsonFeatureCollectionIconLayer = geoJsonFeatureCollectionIconCreator.makeDeckGlLayer();
  const geoJsonArrowLayer = geoJsonArrowCreator.makeDeckGlLayers();
  return geoJsonLinePolygonLayer ?? geoJsonIconLayer ?? geoJsonFeatureCollectionIconLayer ?? geoJsonArrowLayer;
}

class GeoJsonLinePolygonCreator {
  layerType: string = 'geojson';
  private readonly layerConfig: LayerConfig;
  private readonly setTooltipData: SetterOrUpdater<{
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>;
  private readonly setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>;

  constructor(layerConfig: LayerConfig, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
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
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}

class GeoJsonIconLayerCreator {
  layerType: string = 'geojsonicon';
  private readonly layerConfig: LayerConfig;
  private readonly setTooltipData: SetterOrUpdater<{
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>;
  private readonly setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>;

  constructor(layerConfig: LayerConfig, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
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
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
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
  private readonly setTooltipData: SetterOrUpdater<{
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>;
  private readonly setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>;

  constructor(layerConfig: LayerConfig, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
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
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}

interface GeoJsonArrowLayerData<D> extends CompositeLayerProps{
  url?: string;
  mesh: string;
  icon: any;
}

export default class GeoJsonArrowLayer extends CompositeLayer<GeoJsonArrowLayerData<unknown>> {

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

  renderLayers(){
    const { id, visible, url } = this.props;
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
          url: `images/icon_${this.props.icon.color}.png`,
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
        getIcon: (d) => {
          const angle: number = ("方向" in d.properties ? (d.properties.方向 === null ? 0 : d.properties.方向) : 0);
          // const angle = 90
          const anchor: any = this.degreesToAnchorPer(angle,64,64); 
    
          return ({
          id: String(angle),
          url: 'images/arrow.png',
          width: this.props.icon.width,
          height: this.props.icon.height,
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
          // const angle = 90;
          return angle
        },
        updateTriggers: {
          getIcon: this.props.updateTriggers.getIcon,
        }
      })
    ];
  }
}

class GeoJsonArrowLayerCreator {
  layerType: string = 'geojsonarrow';
  private readonly layerConfig: LayerConfig;
  private readonly setTooltipData: SetterOrUpdater<{
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>;
  private readonly setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>;

  constructor(layerConfig: LayerConfig, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
  }

  makeDeckGlLayers() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);

      return new GeoJsonArrowLayer({
        url: layerConfig.source,
        visible: true,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        // @ts-ignore
        sizeScale: 8,
        // @ts-ignore
        iconSizeScale: 60,
        pointType: 'icon',
        ...config,
      });
    };
    

    return null;
  }

  extractLayerConfig = (layerConfig: GeojsonLayerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  isTargetConfig(layerConfig: LayerConfig): layerConfig is GeojsonLayerConfig {
    return layerConfig.type === this.layerType;
  }

  showToolTip = (info: PickInfo<any>) => {
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}