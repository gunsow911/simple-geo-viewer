import React, { useContext, useEffect, useRef, useState } from 'react';

import { Map, Marker, NavigationControl, Style } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Deck, FlyToInterpolator } from '@deck.gl/core/typed';

import { context } from '@/pages';
import { useFlyTo } from '@/components/Map/Animation/flyTo';
import Legend, { useGetClickedLayerId } from '@/components/Map/Legend';

import BackgroundSelector from './Controller/BackgroundSelector';
import { TimeSlider } from '@/components/Map/Controller/TimeSlider';
import { getLayerConfigById } from '@/components/LayerFilter/config';
import { Backgrounds, Preferences } from '@/components/LayerFilter/loader';
import DashboardPanelManager from '../Dashboard/DashboardPanelManager';
import { useRecoilValue } from 'recoil';
import {
  DashboardLayersState,
  LayersState,
  TemporalLayerConfigState,
  TemporalLayerState,
} from '@/store/LayersState';
import { TooltipDataState } from '@/store/TooltipState';
import { getPropertiesObj } from '@/components/Tooltip/util';

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

const useInitializeMap = (
  maplibreContainer: React.MutableRefObject<HTMLDivElement | null>,
  deckglContainer: React.MutableRefObject<HTMLCanvasElement | null>,
  preferences: Preferences
) => {
  const { backgrounds, initialView, menu } = preferences;
  const [currentZoomLevel, setCurrentZoomLevel] = useState(0);
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
        setCurrentZoomLevel(viewState.zoom);
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
    currentZoomLevel,
  };
};

const useShowTooltip = (map: any) => {
  const pointMarkerRef = useRef<any>();

  const tooltipData = useRecoilValue(TooltipDataState);
  useEffect(() => {
    if (!tooltipData || !tooltipData.data) {
      if (pointMarkerRef.current) {
        pointMarkerRef.current.remove();
      }
    } else {
      const { data, tooltipType, id, lat, lng } = tooltipData;
      getPropertiesObj(data, !tooltipType ? 'default' : tooltipType, id);
      if (map) {
        pointMarkerRef.current = new Marker().setLngLat([lng, lat]).addTo(map);
      }
    }
  }, [map, tooltipData]);
};

const useDeckGLLayer = (currentZoomLevel: number, config) => {
  const deckglLayers = useRecoilValue(LayersState);
  const temporalLayers = useRecoilValue(TemporalLayerState);
  const dL = deckglLayers.map((layer) => {
    return layer.clone({
      visible: !layer.props || !layer.props.minzoom || layer.props.minzoom <= currentZoomLevel,
    });
  });
  const tdL = temporalLayers.map((layer) => {
    return layer.clone({
      visible: !layer.props || !layer.props.minzoom || layer.props.minzoom <= currentZoomLevel,
    });
  });
  return [...dL, ...tdL]
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
};

const MapComponent: React.VFC = () => {
  const maplibreContainer = useRef<HTMLDivElement | null>(null);
  const deckglContainer = useRef<HTMLCanvasElement | null>(null);
  const { preferences } = useContext(context);
  const temporalLayerConfigs = useRecoilValue(TemporalLayerConfigState);
  const dashboardLayers = useRecoilValue(DashboardLayersState);
  //map・deckインスタンスを初期化
  const { deckGLRef, mapRef, currentZoomLevel } = useInitializeMap(
    maplibreContainer,
    deckglContainer,
    preferences
  );
  const deckglLayers = useDeckGLLayer(currentZoomLevel, preferences.config);
  //クリックされたレイヤに画面移動
  useFlyTo(deckGLRef.current);

  // ダッシュボードのレイヤーと統合
  if (deckGLRef.current) {
    deckGLRef.current.setProps({ layers: [...deckglLayers, ...dashboardLayers] });
  }

  useShowTooltip(mapRef.current);

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
          {temporalLayerConfigs.length ? <TimeSlider /> : null}
        </div>
        <DashboardPanelManager />
      </div>
    </>
  );
};

export default MapComponent;
