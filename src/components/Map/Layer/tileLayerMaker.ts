import { Map } from 'maplibre-gl';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { Dispatch, SetStateAction } from 'react';

type tileLayerConfig = {
  id: string;
  type: string;
  source: string;
  visible: boolean;
  minZoom: number;
  maxZoom: number;
};

/**
 * TileLayerの作成
 * @param layerConfig 作成したいlayerのコンフィグ
 * @param setTooltipData  Click時に表示するsetTooltipData関数
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeTileLayer(layerConfig, setTooltipData, setsetTooltipPosition) {
  const tileCreator = new tileLayerCreator(layerConfig, setTooltipData, setsetTooltipPosition);
  return tileCreator.makeDeckGlLayer();
}

class tileLayerCreator {
  private readonly layerConfig: any;
  private readonly layerType: string = 'raster';
  private readonly setTooltipData: Dispatch<SetStateAction<any>>;
  private readonly setsetTooltipPosition: Dispatch<SetStateAction<any>>;

  constructor(layerConfig: any, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);

      return new TileLayer({
        data: layerConfig.source,
        visible: true,
        tileSize: 256,

        renderSubLayers: (props) => {
          const {
            bbox: { west, south, east, north },
          } = props.tile;

          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          });
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

  private isTargetConfig(layerConfig: any): layerConfig is tileLayerConfig {
    return layerConfig.type === this.layerType;
  }
}
