import { PickInfo, RGBAColor } from 'deck.gl';
import { ArcLayer } from '@deck.gl/layers';

import { SetterOrUpdater } from 'recoil';
import { showToolTip } from '@/components/Tooltip/show';

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
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}
