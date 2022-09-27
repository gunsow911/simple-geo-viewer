import { Deck } from '@deck.gl/core/typed';
import { makeTuMeshVolumeLayer } from '@/components/Dashboard/Menu/TuMeshVolume';

export const makeDashboardLayers = (deck: Deck) => {
  if (!deck) return;

  const layers: any[] = [];
  layers.push(makeTuMeshVolumeLayer());

  deck.setProps({
    layers: [...deck.props.layers, ...layers],
  });
};
