import { PickInfo } from 'deck.gl';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { SetterOrUpdater } from 'recoil';
import { showToolTip } from '@/components/Tooltip/show';

type tile3DLayerConfig = {
  id: string;
  type: string;
  source: string;
  visible: boolean;
};

/**
 * Tile3DLayerの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeTile3DLayer(layerConfig, setTooltipData, setTooltipPosition) {
  const tile3DCreator = new Tile3DLayerCreator(layerConfig, setTooltipData, setTooltipPosition);
  return tile3DCreator.makeDeckGlLayer();
}

class Tile3DLayerCreator {
  private readonly layerConfig: any;
  private readonly layerType: string = '3dtiles';
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

      return new Tile3DLayer({
        data: layerConfig.source,
        visible: true,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        _subLayerProps: {
          scenegraph: { _lighting: 'flat' },
        },
        ...config,
      });
    }
    return null;
  }

  private extractLayerConfig = (layerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  private isTargetConfig(layerConfig: any): layerConfig is tile3DLayerConfig {
    return layerConfig.type === this.layerType;
  }

  private showToolTip = (info: PickInfo<any>) => {
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}
