import { atom } from 'recoil';
import { LayerConfig } from '@/components/LayerFilter/config';
import { Layer } from '@deck.gl/core/typed';
import { WeatherMapRow } from '@/components/Map/CustomLayer/useWeatherMap';
import { Feature, Point } from 'geojson';

export const LayersState = atom<any>({
  key: 'layers',
  dangerouslyAllowMutability: true,
  default: [],
});

export const TemporalLayerConfigState = atom<LayerConfig[]>({
  key: 'temporalLayerConfigs',
  default: [],
});

export const TemporalLayerState = atom<any>({
  key: 'temporalLayer',
  dangerouslyAllowMutability: true,
  default: [],
});

export const DashboardLayersState = atom<Layer[]>({
  key: 'dashboardLayers',
  dangerouslyAllowMutability: true,
  default: [],
});

export type BaseInformationProperty = {
  locationName: string;
  startDate: string;
  endDate: string;
  altitude: number;
};
export type CustomLayerProperty = {
  minzoom: number;
  show: boolean;
  downloadUrl: string;
};

type WeatherMapStateAtom = {
  layer?: Layer<CustomLayerProperty>;
  showPanel: boolean;
  feature?: Feature<Point, BaseInformationProperty>;
  data?: WeatherMapRow[];
};
export const WeatherMapState = atom<WeatherMapStateAtom>({
  key: 'weatherMap',
  dangerouslyAllowMutability: true,
  default: {
    layer: undefined,
    showPanel: false,
    feature: undefined,
    data: undefined,
  },
});
