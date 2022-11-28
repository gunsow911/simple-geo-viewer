import { atom } from 'recoil';
import { LayerConfig } from '@/components/LayerFilter/config';

export const LayersState = atom<any>({
  key: 'layers',
  dangerouslyAllowMutability: true,
  default: [],
});

export const TemporalLayerConfigState = atom<LayerConfig[]>({
  key: 'temporalLayerConfigs',
  dangerouslyAllowMutability: true,
  default: [],
});

export const TemporalLayerState = atom<any>({
  key: 'temporalLayer',
  default: [],
});
