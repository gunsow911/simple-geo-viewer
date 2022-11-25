import { atom } from 'recoil';

export const TooltipDataState = atom<{
  lng: number;
  lat: number;
  tooltipType: 'default' | 'thumbnail' | 'table';
  id: string;
  data: any;
} | null>({
  key: 'tooltipData',
  default: null,
});

export const TooltipPositionState = atom<{
  top: string;
  left: string;
} | null>({
  key: 'tooltipPosition',
  default: null,
});
