import { PickInfo } from 'deck.gl';
import { IconLayer } from '@deck.gl/layers';
import { SetterOrUpdater } from 'recoil';
import { showToolTip } from '@/components/Tooltip/show';

type iconLayerConfig = {
  id: string;
  type: string;
  source: string;
  visible: boolean;
};

/**
 * IconLayerの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeIconLayer(layerConfig, setTooltipData, setTooltipPosition) {
  const iconLayerCreator = new IconLayerCreator(layerConfig, setTooltipData, setTooltipPosition);
  return iconLayerCreator.makeDeckGlLayer();
}

class IconLayerCreator {
  private readonly layerConfig: any;
  private readonly layerType: string = 'icon';
  private readonly setTooltipData: SetterOrUpdater<{
    lng: number;
    lat: number;
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

  /**
   * makeDeckGlLayer
   * DeckGLのレイヤー作成
   * 初期表示レイヤーの場合visibilityをtrueの状態で返す
   */
  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);

      return new IconLayer({
        id: layerConfig.id,
        data: [layerConfig],
        visible: true,
        pickable: true,
        getIcon: (_) => ({
          url: layerConfig.source,
          width: 100,
          height: 150,
          anchorY: 128,
          mask: false,
        }),
        sizeScale: 8,
        getSize: 5,
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

  private isTargetConfig(layerConfig: any): layerConfig is iconLayerConfig {
    return layerConfig.type === this.layerType;
  }

  private showToolTip = (info: PickInfo<any>) => {
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}
