import { atom } from 'recoil';
import { LayerConfig } from '@/components/LayerFilter/config';
import { Layer } from '@deck.gl/core/typed';

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
