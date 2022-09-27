import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { colorContinuous } from '@deck.gl/carto/typed';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';

export const makeTuMeshVolumeLayer = () => {
  const layer = new GeoJsonLayer<Feature<Geometry, GeoJsonProperties>>({
    id: 'tu-mesh-volume',
    data: '/data/nanto/tu-mesh-volume.json',
    visible: true,
    pickable: true,
    stroked: false,
    filled: true,
    // @ts-ignore
    getFillColor: colorContinuous({
      attr: 'v',
      domain: [0, 40],
      colors: [
        [0, 243, 255, 200],
        [255, 57, 0, 200],
      ],
    }),
  });

  return layer;
};
