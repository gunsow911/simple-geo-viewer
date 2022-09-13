import { Map } from 'maplibre-gl';
import { PickInfo } from 'deck.gl';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { show } from '@/components/Tooltip/show';
import { Dispatch, SetStateAction } from 'react';

type tile3DLayerConfig = {
  id: string;
  type: string;
  source: string;
  visible: boolean;
};

/**
 * Tile3DLayerの作成
 * @param map mapインスタンス
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param init 初期表示レイヤー生成かどうか
 * @param setTooltipData Click時に表示するsetTooltipData関数
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeTile3DLayers(map: Map, layerConfig, init: boolean, setTooltipData, setsetTooltipPosition) {
  const tile3DCreator = new Tile3DLayerCreator(layerConfig, map, setTooltipData, setsetTooltipPosition);
  return tile3DCreator.makeDeckGlLayers(init);
}

class Tile3DLayerCreator {
  private readonly map: Map;
  private readonly layerConfig: any[];
  private readonly layersType: string = '3dtiles';
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

    const result: Tile3DLayer<any>[] = targetLayerConfigs.map((layerConfig) => {
      const config = this.extractLayerConfig(layerConfig);

      console.log(layerConfig.source);

      return new Tile3DLayer({
        data: layerConfig.source,
        visible: init,
        pickable: true,
        autoHighlight: true,
        onClick: this.showToolTip,
        _subLayerProps: {
          scenegraph: { _lighting: 'flat' },
        },
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
    return this.layerConfig.filter((layer: tile3DLayerConfig) => {
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
