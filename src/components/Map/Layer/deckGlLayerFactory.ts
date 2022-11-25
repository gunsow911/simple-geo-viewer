import { Map } from 'maplibre-gl';
import { makeGeoJsonLayer } from '@/components/Map/Layer/geoJsonLayerMaker';
import { makeArcLayer } from '@/components/Map/Layer/arcLayerMaker';
import { makeMvtLayer } from '@/components/Map/Layer/mvtLayerMaker';
import { makeGltfLayer } from '@/components/Map/Layer/gltfLayerMaker';
import { makeTileLayer } from '@/components/Map/Layer/tileLayerMaker';
import { addRenderOption } from '@/components/Map/Layer/renderOption';
import { getFilteredLayerConfig, Config, LayerConfig } from '@/components/LayerFilter/config';
import { makeIconLayer } from '@/components/Map/Layer/iconLayerMaker';
import { Dispatch, SetStateAction } from 'react';
import { Deck } from 'deck.gl';
import { getDataList, Menu } from '@/components/LayerFilter/menu';
import { makeTile3DLayer } from '@/components/Map/Layer/tile3DLayerMaker';
import { SetterOrUpdater } from 'recoil';

export const makeDeckGLLayer = (
  layerConfig: LayerConfig,
  setTooltipData: SetterOrUpdater<{
    lng: number;
    lat: number;
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>,
  setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>
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
  const createdLayer = layerCreator
    .map((func) => {
      return addRenderOption(func(layerConfig, setTooltipData, setTooltipPosition));
    })
    .filter(Boolean);
  console.log(createdLayer);
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
  setTooltipPosition: Dispatch<SetStateAction<any>>,
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
      LayerLoader(addRenderOption(func(lc, setTooltipData, setTooltipPosition)));
    });
  });

  // 初期表示のレイヤーのロード完了を検知する方法がないため1sec初期表示以外のレイヤーのロードを遅らせる
  setTimeout(() => {
    const layerConfig = getFilteredLayerConfig(menu, config).filter((layer) => {
      return getDataList(menu).some((value) => !value.checked && value.id.includes(layer.id));
    });
    layerConfig.forEach((lc) => {
      layerCreator.forEach((func) => {
        LayerLoader(addRenderOption(func(lc, setTooltipData, setTooltipPosition)));
      });
    });
  }, 1000);
};
