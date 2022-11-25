import { Map } from 'maplibre-gl';
import { PickInfo } from 'deck.gl';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { show } from '@/components/Tooltip/show';
import { Dispatch, SetStateAction } from 'react';
import { getPropertiesObj } from '@/components/Tooltip/util';
import { SetterOrUpdater } from 'recoil';

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
