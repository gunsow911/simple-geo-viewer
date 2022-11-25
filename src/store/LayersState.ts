import { atom } from 'recoil';

export const LayersState = atom<any>({
  key: 'layers',
  dangerouslyAllowMutability: true,
  default: [],
});
