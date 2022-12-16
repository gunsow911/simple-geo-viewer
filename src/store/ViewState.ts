import { atom } from 'recoil';

export const ViewState = atom<Record<string, any>>({
  key: 'viewState',
  dangerouslyAllowMutability: true,
  default: [],
});
