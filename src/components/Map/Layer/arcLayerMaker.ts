import { PickInfo, RGBAColor } from 'deck.gl';
import { ArcLayer } from '@deck.gl/layers';

import { getPropertiesObj } from '@/components/Tooltip/util';
import { SetterOrUpdater } from 'recoil';

type ArcLayerConfig = {
  id: string;
  type: string;
  source: string;
  visible: boolean;
  fillColor?: RGBAColor;
  lineColor?: RGBAColor;
  opacity?: number;
};

/**
 * makeArcLayersの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeArcLayer(layerConfig, setTooltipData, setTooltipPosition) {
  const ArcCreator = new ArcLayerCreator(layerConfig, setTooltipData, setTooltipPosition);
  return ArcCreator.makeDeckGlLayer();
}

class ArcLayerCreator {
  private layerType: string = 'Arc';
  private readonly layerConfig: any;
  setTooltipData: SetterOrUpdater<{
    lng: number;
    lat: number;
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>;
  setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>;

  constructor(layerConfig: any, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
  }

  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);
      return new ArcLayer({
        id: layerConfig.id,
        visible: true,
        pickable: true,
        data: layerConfig.source,
        getWidth: layerConfig.width,
        getSourcePosition: (d) => d.from.coordinates,
        getTargetPosition: (d) => d.to.coordinates,
        getSourceColor: layerConfig.sourceColor,
        getTargetColor: layerConfig.targetColor,
        ...config,
      });
    }

    return null;
  }

  private extractLayerConfig = (layerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  private isTargetConfig(layerConfig: any): boolean {
    return layerConfig.type === this.layerType;
  }

  private showToolTip = (info: PickInfo<any>) => {
    // @ts-ignore
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
    this.setTooltipPosition({
      top: `${String(y)}px`,
      left: `${String(x)}px`,
    });
    const data = getPropertiesObj(object, tooltipType, id);
    this.setTooltipData({
      lng: coordinate[0],
      lat: coordinate[1],
      tooltipType,
      id,
      data,
    });
  };
}
