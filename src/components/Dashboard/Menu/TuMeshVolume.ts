import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { colorContinuous } from '@deck.gl/carto/typed';
import { Feature } from 'geojson';
import { DashboardLayerProps } from '../useDashboard';

export const makeTuMeshVolumeHeatmapLayer = () => {
  const layer = new GeoJsonLayer<Feature, DashboardLayerProps>({
    id: 'tu-mesh-volume-heatmap',
    dashboardMenuId: 'tu-mesh-volume',
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
        [0, 243, 255, 170],
        [255, 57, 0, 170],
      ],
    }),
  });
  return layer;
};
