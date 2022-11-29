import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import { fetchFile, parse } from '@loaders.gl/core';
import { showToolTip } from '../../Tooltip/show';

/**
 * GLTF Layerの作成
 * @param layerConfig {any}
 * @param setTooltipData {Dispatch<SetStateAction<any>>}
 * @param setTooltipPosition ポップアップのスタイルをセットする関数
 * @returns {ScenegraphLayer}
 */
export function makeGltfLayer(layerConfig, setTooltipData, setTooltipPosition) {
  const gltfCreator = new gltfLayerCreator(layerConfig, setTooltipData, setTooltipPosition);
  return gltfCreator.makeDeckGlLayer();
}

class gltfLayerCreator {
  layerConfig;
  layerType = 'gltf';
  setTooltipData;
  setTooltipPosition;

  /**
   *
   * @param layerConfig {any}
   * @param map {maplibregl.Map}
   * @param setTooltipData {Dispatch<SetStateAction<any>>}
   */
  constructor(layerConfig, setTooltipData, setTooltipPosition) {
    this.layerConfig = layerConfig;
    this.setTooltipData = setTooltipData;
    this.setTooltipPosition = setTooltipPosition;
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
    showToolTip(info, this.setTooltipData, this.setTooltipPosition);
  };
}
