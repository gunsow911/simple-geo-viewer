import { PickInfo } from 'deck.gl';
import { MVTLayer } from '@deck.gl/geo-layers';
import { getPropertiesObj } from '@/components/Tooltip/util';
import { SetterOrUpdater } from 'recoil';

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
