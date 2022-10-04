import { Layer } from '@deck.gl/core/typed';
import { DashboardLayerProps } from '../useDashboard';

export type DashboardAsset<T = {}> = {
  layers: Layer<DashboardLayerProps>[];
  props: T;
};

export type UseMenuReturn<T = {}> = {
  menuId: string;
  asset?: DashboardAsset<T>;
  show: () => void;
  hide: () => void;
  isLoading: boolean;
};
