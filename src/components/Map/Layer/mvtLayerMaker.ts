import { PickInfo } from 'deck.gl';
import { MVTLayer } from '@deck.gl/geo-layers';
import { SetterOrUpdater } from 'recoil';
import { showToolTip } from '@/components/Tooltip/show';

type mvtLayerConfig = {
  id: string;
  type: string;
  source: string;
  visible: boolean;
  opacity?: number;
  minZoom: number;
  maxZoom: number;
  color: number[];
  highlightColor: number[];
};

/**
 * mvtLayerの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeMvtLayer(layerConfig, setTooltipData, setTooltipPosition) {
  const mvtCreator = new MvtLayerCreator(layerConfig, setTooltipData, setTooltipPosition);
  return mvtCreator.makeDeckGlLayer();
}

class MvtLayerCreator {
  private readonly layerConfig: any;
  private readonly layerType: string = 'mvt';
  private readonly setTooltipData: SetterOrUpdater<{
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>;
  private readonly setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>;

  constructor(layerConfig: any, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
  }

  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);
      return new MVTLayer({
        data: layerConfig.source,
        visible: true,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        ...config,
      });
    }

    return null;
  }

  private extractLayerConfig = (layerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  private isTargetConfig(layerConfig: any): layerConfig is mvtLayerConfig {
    return layerConfig.type === this.layerType;
  }

  private showToolTip = (info: PickInfo<any>) => {
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}
