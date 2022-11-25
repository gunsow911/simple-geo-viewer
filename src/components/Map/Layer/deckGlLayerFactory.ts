import { Map } from 'maplibre-gl';
import { makeGeoJsonLayer } from '@/components/Map/Layer/geoJsonLayerMaker';
import { makeArcLayer } from '@/components/Map/Layer/arcLayerMaker';
import { makeMvtLayer } from '@/components/Map/Layer/mvtLayerMaker';
import { makeGltfLayer } from '@/components/Map/Layer/gltfLayerMaker';
import { makeTileLayer } from '@/components/Map/Layer/tileLayerMaker';
import { addRenderOption } from '@/components/Map/Layer/renderOption';
import {
  getFilteredLayerConfig,
  Config,
  getLayerConfigById,
} from '@/components/LayerFilter/config';
import { makeIconLayer } from '@/components/Map/Layer/iconLayerMaker';
import { Dispatch, SetStateAction } from 'react';
import { Deck } from 'deck.gl';
import { getDataList, Menu } from '@/components/LayerFilter/menu';
import { makeTile3DLayer } from '@/components/Map/Layer/tile3DLayerMaker';

export const makeDeckGLLayer = (
  id: string,
  config: Config,
  setTooltipData: Dispatch<SetStateAction<any>>,
  setsetTooltipPosition: Dispatch<SetStateAction<any>>
) => {
  const layerCreator = [
    makeTileLayer,
    makeArcLayer,
    makeMvtLayer,
    makeGltfLayer,
    makeIconLayer,
    makeTile3DLayer,
    makeGeoJsonLayer,
  ];
  // ここでフィルタリングのidを求める
  const layerConfig = getLayerConfigById(id, config);
  if (!layerConfig) {
    return;
  }
  const createdLayer = layerCreator
    .map((func) => {
      return addRenderOption(func(layerConfig, setTooltipData, setsetTooltipPosition));
    })
    .filter(Boolean);
  if (createdLayer.length === 1) {
    return createdLayer[0];
  }
  if (createdLayer.length >= 2) {
    throw new Error('Layer Creation fail: Multi type layer generation detected');
  }
  return;
};

export const makeDeckGlLayers = (
  map: Map,
  deck: Deck,
  setTooltipData: Dispatch<SetStateAction<any>>,
  setsetTooltipPosition: Dispatch<SetStateAction<any>>,
  menu: Menu,
  config: Config
) => {
  if (!map || !deck) return;

  const LayerLoader = (layer) => {
    deck.setProps({
      layers: [...deck.props.layers, layer],
    });
  };
  const layerCreator = [
    makeTileLayer,
    makeArcLayer,
    makeMvtLayer,
    makeGltfLayer,
    makeIconLayer,
    makeTile3DLayer,
    makeGeoJsonLayer,
  ];
  // ここでフィルタリングのidを求める
  const layerConfig = getFilteredLayerConfig(menu, config).filter((layer) => {
    // check状態になっているものを取り出し
    return getDataList(menu).some((value) => value.checked && value.id.includes(layer.id));
  });
  layerConfig.forEach((lc) => {
    layerCreator.forEach((func) => {
      LayerLoader(addRenderOption(func(lc, setTooltipData, setsetTooltipPosition)));
    });
  });

  // 初期表示のレイヤーのロード完了を検知する方法がないため1sec初期表示以外のレイヤーのロードを遅らせる
  setTimeout(() => {
    const layerConfig = getFilteredLayerConfig(menu, config).filter((layer) => {
      return getDataList(menu).some((value) => !value.checked && value.id.includes(layer.id));
    });
    layerConfig.forEach((lc) => {
      layerCreator.forEach((func) => {
        LayerLoader(addRenderOption(func(lc, setTooltipData, setsetTooltipPosition)));
      });
    });
  }, 1000);
};
