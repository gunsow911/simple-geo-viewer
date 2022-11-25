import React, { Dispatch, SetStateAction, useContext, useEffect, useRef } from 'react';

import { Map, Style, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Deck } from '@deck.gl/core/typed';

import { context } from '@/pages';
import { useFlyTo } from '@/components/Map/Animation/flyTo';
import Legend, { useGetClickedLayerId } from '@/components/Map/Legend';

import BackgroundSelector from './Controller/BackgroundSelector';
import { TimeSlider } from '@/components/Map/Controller/TimeSlider';
import { getFilteredLayerConfig, Config } from '@/components/LayerFilter/config';
import { Menu } from '@/components/LayerFilter/menu';
import { TEMPORAL_LAYER_TYPES } from '@/components/Map/Layer/temporalLayerMaker';
import { Preferences, Backgrounds } from '@/components/LayerFilter/loader';
import DashboardPanelManager from '../Dashboard/DashboardPanelManager';
import { useRecoilValue } from 'recoil';
import { LayersState } from '@/store/LayersState';

//let map: Map;
//let deck: Deck;
//let visLayers: visiblyLayers;

const getViewStateFromMaplibre = (map) => {
  const { lng, lat } = map.getCenter();
  return {
    longitude: lng,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
};

/**
 * MapLibre GL JSの初期スタイルを取得する
 * 初期スタイル=./src/assets/backgrounds.jsonで定義された背景が表示されている状態
 */
const getInitialStyle = (backgrounds: Backgrounds): Style => {
  const defaultBackgroundData = backgrounds[Object.keys(backgrounds)[0]];
  const style: Style = {
    version: 8,
    sources: {
      background: defaultBackgroundData.source,
    },
    layers: [
      {
        id: 'background',
        type: 'raster',
        source: 'background',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };
  return style;
};

const checkZoomVisible = () => {
  //TODO これ何か確認する
  /*
  const deckGlLayers = deck.props.layers;
  const zommVisibleLayers = zoomVisibly(deckGlLayers, visLayers);
  deck.setProps({ layers: zommVisibleLayers });*/
};

const useInitializeMap = (
  maplibreContainer: React.MutableRefObject<HTMLDivElement | null>,
  deckglContainer: React.MutableRefObject<HTMLCanvasElement | null>,
  preferences: Preferences
) => {
  const { backgrounds, initialView, menu } = preferences;
  const deckGLRef = useRef<any>();
  const mapRef = useRef<any>();
  useEffect(() => {
    if (!mapRef.current) {
      if (!maplibreContainer.current) return;
      mapRef.current = new Map({
        container: maplibreContainer.current,
        style: getInitialStyle(backgrounds),
        center: initialView.map.center,
        zoom: initialView.map.zoom,
        bearing: initialView.map.bearing,
        pitch: initialView.map.pitch,
        //deck.gl側にマップの操作を任せるためにfalseに設定
        interactive: false,
      });
    }

    //visLayers = new visiblyLayers(menu, initialView.map.zoom);
    // @ts-ignore
    const gl = mapRef.current.painter.context.gl;
    deckGLRef.current = new Deck({
      initialViewState: {
        latitude: initialView.map.center[1],
        longitude: initialView.map.center[0],
        bearing: initialView.map.bearing,
        pitch: initialView.map.pitch,
        zoom: initialView.map.zoom,
      },
      canvas: deckglContainer.current!,
      controller: true,
      onViewStateChange: ({ viewState }) => {
        mapRef.current.jumpTo({
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          bearing: viewState.bearing,
          pitch: viewState.pitch,
        });
        //visLayers.setzoomLevel(viewState.zoom);
      },
      onBeforeRender: () => {
        checkZoomVisible();
      },
      layers: [],
    });

    mapRef.current.addControl(new NavigationControl());

    mapRef.current.on('moveend', (_e) => {
      deckGLRef.current.setProps({ initialViewState: getViewStateFromMaplibre(mapRef.current) });
    });
  }, []);
  return {
    deckGLRef,
    mapRef,
  };
};

const useToggleVisibly = (menu: Menu, config: Config) => {
  /*
  const { checkedLayerTitleList } = useContext(context);

  if (!deck) return;
  const deckGlLayers = deck.props.layers;
  const toggleVisibleLayers = toggleVisibly(deckGlLayers, checkedLayerTitleList, menu);
  const zoomVisibleLayers = zoomVisibly(toggleVisibleLayers, visLayers);
  const priorityViewLayer = zoomVisibleLayers
    .map((layer) => {
      if (getLayerConfigById(layer.id, config)?.type === 'geojsonicon') {
        return { index: 1, layer: layer };
      } else {
        return { index: 0, layer: layer };
      }
    })
    .sort((a, b) => a.index - b.index)
    .map((obj) => {
      return obj.layer;
    });
  deck.setProps({ layers: priorityViewLayer });
  visLayers.setlayerList(checkedLayerTitleList);
  return priorityViewLayer;

   */
};

type Props = {
  setTooltipData: Dispatch<SetStateAction<any>>;
};

const MapComponent: React.VFC<Props> = ({ setTooltipData }) => {
  const maplibreContainer = useRef<HTMLDivElement | null>(null);
  const deckglContainer = useRef<HTMLCanvasElement | null>(null);
  const { preferences } = useContext(context);
  //const { layers: dashboardLayers } = useDashboardContext();
  const deckglLayers = useRecoilValue(LayersState);
  const visibleLayerTypes = getFilteredLayerConfig(preferences.menu, preferences.config).map(
    (item) => {
      return item.type;
    }
  );
  const hasTimeSeries = !!visibleLayerTypes.find((item) => TEMPORAL_LAYER_TYPES.includes(item));

  //map・deckインスタンスを初期化
  const { deckGLRef, mapRef } = useInitializeMap(maplibreContainer, deckglContainer, preferences);
  /*
  //対象のレイヤを全て作成してdeckに登録
  useEffect(() => {
    map.on('load', () => {
      makeDeckGlLayers(
        map,
        deck,
        setTooltipData,
        setsetTooltipPosition,
        preferences.menu,
        preferences.config
      );
      checkZoomVisible();
    });
  }, []);

  //layerの可視状態を変更
  const visibleLayers = useToggleVisibly(preferences.menu, preferences.config);
  */

  //クリックされたレイヤに画面移動
  useFlyTo(deckGLRef.current);
  // ダッシュボードのレイヤーと統合
  useEffect(() => {
    if (deckGLRef.current) {
      deckGLRef.current.setProps({ layers: [...(deckglLayers ?? [])] });
    }
  }, [deckGLRef, deckglLayers]);

  return (
    <>
      <div className="h-full" ref={maplibreContainer}>
        <canvas className="z-10 absolute h-full" ref={deckglContainer}></canvas>
        <div className="z-10 absolute top-2 left-2 w-60">
          <Legend id={useGetClickedLayerId()} />
        </div>
        <div className="z-10 absolute top-2 right-12 bg-white p-1">
          <div className="text-center font-bold">背景</div>
          <BackgroundSelector map={mapRef.current} />
        </div>
        <div className="z-10 absolute bottom-0 left-0 w-2/5 bg-white">
          {hasTimeSeries ? (
            <TimeSlider
              deck={deckGLRef.current}
              map={mapRef.current}
              setTooltipData={setTooltipData}
            />
          ) : null}
        </div>
        <DashboardPanelManager />
      </div>
    </>
  );
};

export default MapComponent;
