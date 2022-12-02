type TemporalLayerType =
  | 'bus_trip'
  | 'temporal_polygon'
  | 'temporal_line'
  | 'trips_json'
  | 'trips_drm';
export const TEMPORAL_LAYER_TYPES: Array<TemporalLayerType | string> = [
  'bus_trip',
  'temporal_polygon',
  'temporal_line',
  'trips_json',
  'trips_drm',
];

import { IconLayer, GeoJsonLayer } from '@deck.gl/layers';
import { RGBAColor, TripsLayer } from 'deck.gl';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Menu } from '@/components/LayerFilter/menu';

/**
 * 時系列アニメーションDeckGLレイヤーを作成する
 * @param layerConfig
 * @param init
 * @param timestamp
 * @param checkedLayerTitleList
 * @returns
 */
export function makeTemporalLayer(
  layerConfig,
  timestamp: number,
  checkedLayerTitleList: string[] = [],
  menu: Menu
) {
  const bustripCreator = new BusTripLayerCreator(layerConfig, checkedLayerTitleList, menu);
  const temporalPolygonCreator = new TemporalPolygonLayerCreator(
    layerConfig,
    checkedLayerTitleList,
    menu
  );
  const temporalLineCreator = new TemporalLineLayerCreator(
    layerConfig,
    checkedLayerTitleList,
    menu
  );
  const tripsJsonCreator = new TripsJsonLayerCreator(layerConfig, checkedLayerTitleList, menu);
  const tripsDRMLayerCreator = new TripsDRMLayerCreator(layerConfig, checkedLayerTitleList, menu);
  const bustripLayer = bustripCreator.makeDeckGlLayer(timestamp);
  const temporalPolygonLayer = temporalPolygonCreator.makeDeckGlLayer(timestamp);
  const temporalLineLayer = temporalLineCreator.makeDeckGlLayer(timestamp);
  const tripsJsonLayer = tripsJsonCreator.makeDeckGlLayer(timestamp);
  const tripsDRMLayer = tripsDRMLayerCreator.makeDeckGlLayer(timestamp);
  return (
    bustripLayer ?? temporalPolygonLayer ?? temporalLineLayer ?? tripsJsonLayer ?? tripsDRMLayer
  );
}

abstract class TemporalLayerCreator {
  layerType: TemporalLayerType = 'bus_trip';
  layerConfig: any;
  checkedLayerTitleList: string[];
  private _menu: Menu;

  constructor(layerConfig: any, checkedLayerTitleList: string[] = [], menu: Menu) {
    this.layerConfig = layerConfig;
    this.checkedLayerTitleList = checkedLayerTitleList;
    this._menu = menu;
  }
  abstract makeDeckGlLayer(timestamp): any;
  /**
   * layersTypeに適合するレイヤーコンフィグを取り出し
   */
  extractTargetConfig() {
    return this.layerConfig.filter((layer) => layer.type === this.layerType);
  }

  /**
   * 値をlayerConfig.valuesの値とでnormalizeする
   */
  generateNormalizedValue(value, layerConfig) {
    return Math.max(
      0,
      Math.min(1, (value - layerConfig.values[0]) / (layerConfig.values[1] - layerConfig.values[0]))
    );
  }

  /**
   * layerConfig.colorsの値からcolorを生成する
   */
  generateColor(value, layerConfig): RGBAColor {
    const [r1, g1, b1, a1] = layerConfig.colors[0];
    const [r2, g2, b2, a2] = layerConfig.colors[1];
    return [
      r1 * (1 - value) + r2 * value,
      g1 * (1 - value) + g2 * value,
      b1 * (1 - value) + b2 * value,
      a1 * (1 - value) + a2 * value,
    ];
  }

  isTargetConfig(layerConfig: any): boolean {
    return layerConfig.type === this.layerType;
  }
}

class BusTripLayerCreator extends TemporalLayerCreator {
  layerType: TemporalLayerType = 'bus_trip';

  makeDeckGlLayer(timestamp) {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const iconUrl = layerConfig.iconUrl ? layerConfig.iconUrl : 'images/bus_yellow.png';
      const TrackingL = new IconLayer({
        id: layerConfig.id,
        data: layerConfig.source,
        visible: true,
        lastPositions: {},
        getIcon: () => {
          return {
            url: iconUrl,
            width: 64,
            height: 64,
            anchorY: 64,
          };
        },
        getSize: () => {
          return layerConfig.getSize ? layerConfig.getSize : 50;
        },
        sizeScale: layerConfig.sizeScale || 1,
        getPosition: (d: any) => {
          const p = d.segments.filter((pos) => pos[2] == timestamp);
          if (p.length == 0) {
            // 時刻内かつ timestamp が一致しない場合は最後に描画した位置を使用する
            if (timestamp > d.segments[0][2] && timestamp < d.segments.slice(-1)[0][2]) {
              return TrackingL.props.lastPositions[d.properties.id];
            }
            return null;
          }
          const pos = [p.slice(-1)[0][0], p.slice(-1)[0][1]];
          TrackingL.props.lastPositions[d.properties.id] = pos;
          return pos;
        },
        pickable: true,
        //onClick: (info) => this.showTooltip(info, d.type),
        updateTriggers: {
          getPosition: [timestamp],
        },
      });
      return TrackingL;
    }
    return null;
  }
}

class TemporalPolygonLayerCreator extends TemporalLayerCreator {
  layerType: TemporalLayerType = 'temporal_polygon';

  makeDeckGlLayer(timestamp: number) {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      return new GeoJsonLayer({
        id: layerConfig.id,
        data: layerConfig.source,
        visible: true,
        extruded: true,
        getLineColor: () => [0, 0, 0, 0],
        getFillColor: (d: any) => {
          const normalizedTimestamp = timestamp - (timestamp % d.properties.step);
          const temporalValue: number =
            d.properties[String(normalizedTimestamp).padStart(2, '0')] || 0;

          const normalizedValue = this.generateNormalizedValue(temporalValue, layerConfig);
          return this.generateColor(normalizedValue, layerConfig);
        },
        getElevation: (d: any) => {
          const normalizedTimestamp = timestamp - (timestamp % d.properties.step);
          const temporalValue: number =
            d.properties[String(normalizedTimestamp).padStart(2, '0')] || 0;
          const normalizedValue = Math.max(
            0,
            Math.min(
              1,
              (temporalValue - layerConfig.values[0]) /
                (layerConfig.values[1] - layerConfig.values[0])
            )
          );
          const heights = layerConfig.heights || [0, 0];
          const height = heights[0] * (1 - normalizedValue) + heights[1] * normalizedValue;
          return height;
        },
        updateTriggers: {
          getFillColor: [timestamp],
          getElevation: [timestamp],
        },
      });
    }
    return null;
  }
}

class TemporalLineLayerCreator extends TemporalLayerCreator {
  layerType: TemporalLayerType = 'temporal_line';

  makeDeckGlLayer(timestamp: number) {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      return new GeoJsonLayer({
        id: layerConfig.id,
        data: layerConfig.source,
        visible: true,
        extruded: true,
        getLineColor: (d: any) => {
          const normalizedTimestamp = timestamp - (timestamp % d.properties.step);
          const temporalValue: number =
            d.properties[String(normalizedTimestamp).padStart(2, '0')] || 0;

          const normalizedValue = this.generateNormalizedValue(temporalValue, layerConfig);
          return this.generateColor(normalizedValue, layerConfig);
        },
        getLineWidth: (d: any) => {
          const normalizedTimestamp = timestamp - (timestamp % d.properties.step);
          const temporalValue: number =
            d.properties[String(normalizedTimestamp).padStart(2, '0')] || 0;

          const normalizedValue = this.generateNormalizedValue(temporalValue, layerConfig);
          const widths = layerConfig.widths || [5, 5];
          const width = widths[0] * (1 - normalizedValue) + widths[1] * normalizedValue;
          return width;
        },
        updateTriggers: {
          getLineColor: [timestamp],
          getElevation: [timestamp],
        },
      });
    }
    return null;
  }
}

class TripsJsonLayerCreator extends TemporalLayerCreator {
  layerType: TemporalLayerType = 'trips_json';

  makeDeckGlLayer(timestamp: number) {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      return new TripsLayer({
        id: layerConfig.id,
        data: layerConfig.source,
        visible: true,
        getTimestamps: (d) => d.timestamps,
        getColor: layerConfig.color || [255, 0, 0],
        currentTime: timestamp,
        trailLength: layerConfig.trailLength || 15,
        widthMinPixels: layerConfig.width || 3,
        updateTriggers: {
          currentTime: [timestamp],
        },
      });
    }
    return null;
  }
}
class TripsDRMLayerCreator extends TemporalLayerCreator {
  // レイヤータイプは'trips_drm'
  layerType: TemporalLayerType = 'trips_drm';

  makeDeckGlLayer(timestamp: number) {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      return new MVTLayer({
        id: layerConfig.id,
        data: layerConfig.source,
        // @ts-ignore
        getLineColor: (d: any) => {
          const dataIndex: number = Math.trunc(timestamp / layerConfig.step);
          const temporalValue: number = JSON.parse('[' + d.properties.traffic_volume + ']')[
            dataIndex
          ];
          // 0〜1の範囲にノーマライズの計算
          const normalizedValue = this.generateNormalizedValue(temporalValue, layerConfig);
          return this.generateColor(normalizedValue, layerConfig);
        },
        // 線幅の表示
        getLineWidth: (d: any) => {
          const dataIndex: number = Math.trunc(timestamp / layerConfig.step);
          const temporalValue: number = JSON.parse('[' + d.properties.traffic_volume + ']')[
            dataIndex
          ];
          const normalizedValue = this.generateNormalizedValue(temporalValue, layerConfig);
          const widths = layerConfig.widths || [5, 5];
          const width = widths[0] * (1 - normalizedValue) + widths[1] * normalizedValue;
          return width;
        },
        // 最低5Pixcl幅で表示
        lineWidthMinPixels: 5,
        visible: true,
        stroked: false,
        filled: true,
        updateTriggers: {
          getLineColor: [timestamp],
          getLineWidth: [timestamp],
        },
      });
    }
    return null;
  }
}
