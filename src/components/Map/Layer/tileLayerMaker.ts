import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { SetterOrUpdater } from 'recoil';

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
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 */
export function makeTileLayer(layerConfig, setTooltipData, setTooltipPosition) {
  const tileCreator = new tileLayerCreator(layerConfig, setTooltipData, setTooltipPosition);
  return tileCreator.makeDeckGlLayer();
}

class tileLayerCreator {
  private readonly layerConfig: any;
  private readonly layerType: string = 'raster';
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
