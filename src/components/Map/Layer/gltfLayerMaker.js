import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import { fetchFile, parse } from '@loaders.gl/core';
import { show } from '@/components/Tooltip/show';

/**
 * GLTF Layerの作成
 * @param layerConfig {any}
 * @param setTooltipData {Dispatch<SetStateAction<any>>}
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 * @returns {ScenegraphLayer}
 */
export function makeGltfLayer(layerConfig, setTooltipData, setsetTooltipPosition) {
  const gltfCreator = new gltfLayerCreator(layerConfig, setTooltipData, setsetTooltipPosition);
  return gltfCreator.makeDeckGlLayer();
}

class gltfLayerCreator {
  layerConfig;
  layerType = 'gltf';
  setTooltipData;
  setsetTooltipPosition;

  /**
   *
   * @param layerConfig {any}
   * @param map {maplibregl.Map}
   * @param setTooltipData {Dispatch<SetStateAction<any>>}
   */
  constructor(layerConfig, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  /**
   * DeckGLLayerの作成
   * @returns {ScenegraphLayer}
   */
  makeDeckGlLayer() {
    const { layerConfig } = this;
    if (this.isTargetConfig(layerConfig)) {
      const config = this.extractLayerConfig(layerConfig);

      const content = fetchFile(layerConfig.source);

      const scenegraph = parse(content, GLTFLoader);

      return new ScenegraphLayer({
        data: layerConfig.source,
        visible: true,
        pickable: true,
        scenegraph: scenegraph,
        _lighting: 'flat',
        autoHighlight: true,
        onClick: this.showToolTip,
        ...config,
      });
    }
    return null;
  }

  extractLayerConfig = (layerConfig) => {
    const { type, source, visible, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  isTargetConfig(layer) {
    return layer.type === this.layerType;
  }

  showToolTip = (info) => {
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
    this.setsetTooltipPosition({
      top: `${String(y)}px`,
      left: `${String(x)}px`,
    });
    /* TODO Tooltipをrecoilベースに変更する
    show(object, coordinate[0], coordinate[1], this.map, this.setTooltipData, tooltipType, id);

     */
  };
}
