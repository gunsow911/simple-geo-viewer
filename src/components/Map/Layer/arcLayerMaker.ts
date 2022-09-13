import { Map } from 'maplibre-gl';
import { PickInfo, RGBAColor } from 'deck.gl';
import { ArcLayer } from '@deck.gl/layers';

import { show } from '@/components/Tooltip/show';
import { Dispatch, SetStateAction } from 'react';


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
 * @param map mapインスタンス
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param init 初期表示レイヤー生成かどうか
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeArcLayers(map: Map, layerConfig, init: boolean, setTooltipData, setsetTooltipPosition) {
  const ArcCreator = new ArcLayerCreator(layerConfig, map, setTooltipData, setsetTooltipPosition);
  return ArcCreator.makeDeckGlLayers(init);
}

class ArcLayerCreator {
  private layersType: string = 'Arc';
  private readonly layerConfig: any[];
  private readonly map: Map;
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: any[], map: Map, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.map = map;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayers(init) {
    const targetLayerConfigs = this.extractTargetConfig();

    const result: ArcLayer<any>[] = targetLayerConfigs.map((layerConfig) => {
      const config = this.extractLayerConfig(layerConfig);
      return new ArcLayer({
        id: layerConfig.id,
        visible: init,
        pickable: true,
        data: layerConfig.data,
        getWidth: layerConfig.width,
        getSourcePosition: (d) => d.from.coordinates,
        getTargetPosition: (d) => d.to.coordinates,
        getSourceColor: layerConfig.sourceColor,
        getTargetColor: layerConfig.targetColor,
        ...config,
      });
    });

    return result;
  }

  private extractLayerConfig = (layerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  private extractTargetConfig() {
    return this.layerConfig.filter((layer: ArcLayerConfig) => {
      return layer.type === this.layersType;
    });
  }

  private showToolTip = (info: PickInfo<any>) => {
    // @ts-ignore
    const { coordinate, object } = info;
    if (!coordinate) return;
    if (!object) return;
    // @ts-ignore
    const { layer: { props:{ tooltipType } } } = info;
    const { layer: { id } } = info;
    
    const parent = document.getElementById("MapArea");
    const body = document.getElementsByTagName("body")[0];
    const tooltipWidth = body.clientWidth * 0.25;
    const tooltipHeight = body.clientHeight * 0.25;
    const parentWidth = parent !== null ? (parent.clientWidth) : 10 ;
    const parentHeight = parent !== null ? (parent.clientHeight) : 10 ;

    let x = info.x;
    let y = info.y;

    if (x + tooltipWidth +40 > parentWidth) {
      x = parentWidth -tooltipWidth -40;
    }

    if (y + tooltipHeight +300 > parentHeight) {
      y = parentHeight - tooltipHeight -300;
    }
    this.setsetTooltipPosition({
      top: `${String(y)}px`,
      left: `${String(x)}px`
    });
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);
  };
}
