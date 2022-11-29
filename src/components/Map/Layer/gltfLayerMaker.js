import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import { fetchFile, parse } from '@loaders.gl/core';
import { show, showToolTip } from '@/components/Tooltip/show';

/**
 * GLTF Layerの作成
 * @param map {maplibregl.Map}
 * @param layerConfig {any}
 * @param init {boolean}
 * @param setTooltipData {Dispatch<SetStateAction<any>>}
 * @param setsetTooltipPosition ポップアップのスタイルをセットする関数
 * @returns {ScenegraphLayer[]}
 */
export function makeGltfLayers(map, layerConfig, init, setTooltipData, setsetTooltipPosition) {
  const gltfCreator = new gltfLayerCreator(layerConfig, map, setTooltipData, setsetTooltipPosition);
  return gltfCreator.makeDeckGlLayers(init);
}

class gltfLayerCreator {
  map;
  layerConfig;
  layersType = 'gltf';
  setTooltipData;
  setsetTooltipPosition;

  /**
   *
   * @param layerConfig {any}
   * @param map {maplibregl.Map}
   * @param setTooltipData {Dispatch<SetStateAction<any>>}
   */
  constructor(layerConfig, map, setTooltipData, setsetTooltipPosition) {
    this.layerConfig = layerConfig;
    this.map = map;
    this.setTooltipData = setTooltipData;
    this.setsetTooltipPosition = setsetTooltipPosition;
  }

  /**
   * DeckGLLayerの作成
   * @param init {boolean} 初期表示レイヤーかどうか
   * @returns {ScenegraphLayer[]}
   */
  makeDeckGlLayers(init) {
    const targetLayerConfigs = this.extractTargetConfig();
    return targetLayerConfigs.map((layerConfig) => {
      const config = this.extractLayerConfig(layerConfig);

      const content = fetchFile(layerConfig.source);

      const scenegraph = parse(content, GLTFLoader);

      return new ScenegraphLayer({
        data: layerConfig.source,
        visible: init,
        pickable: true,
        scenegraph: scenegraph,
        _lighting: 'flat',
        autoHighlight: true,
        onClick: this.showToolTip,
        ...config,
      });
    });
  }

  extractLayerConfig = (layerConfig) => {
    const { type, source, ...otherConfig } = layerConfig;
    return otherConfig;
  };

  /**
   * layersTypeに適合するレイヤーコンフィグを取り出し
   * @private
   */
  extractTargetConfig() {
    return this.layerConfig.filter((layer) => {
      return layer.type === this.layersType;
    });
  }

  showToolTip = (info) => {
    showToolTip(info, this.map, this.setTooltipData, this.setsetTooltipPosition);
  };
}
