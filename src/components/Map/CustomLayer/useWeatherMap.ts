import { useEffect, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { useRouter } from 'next/router';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { WeatherMapLayerState } from '@/store/LayersState';
import { Feature, Point } from 'geojson';
import { usePreferences } from '@/components/LayerFilter/loader';

/**
 * 気象データマッピングフック
 */
const useWeatherMap = (weatherMapLayerId: string) => {
  const router = useRouter();
  const subDirectoryPath = router.basePath;
  const [layer, setLayer] = useRecoilState(WeatherMapLayerState);
  const { preferences } = usePreferences();

  useEffect(() => {
    const initVisible =
      preferences?.menu
        .flatMap((folder) => {
          return folder.data;
        })
        .find((data) => {
          const result = data.id.find((id) => {
            return id === weatherMapLayerId;
          });
          return result !== undefined;
        })?.checked ?? false;
    if (initVisible) show();
  }, []);

  const onChangeSelect = (layerId: string, selected: boolean) => {
    if (layerId !== weatherMapLayerId) {
      return;
    }
    selected ? show() : hide();
  };

  const show = () => {
    if (layer) {
      const newLayer = layer.clone({ visible: true });
      setLayer(newLayer);
    } else {
      const newLayer = new GeoJsonLayer<Feature>({
        id: weatherMapLayerId,
        pointType: 'icon',
        data: `${subDirectoryPath}/data/weather_mapping.geojson`,
        getIcon: (_) => ({
          url: `${subDirectoryPath}/images/airport_blue.png`,
          width: 64,
          height: 64,
          anchorY: 64,
          mask: false,
        }),
        visible: true,
        pickable: true,
        onClick: () => {
          console.log('weather_map_marker_clicked.');
        },
      });
      setLayer(newLayer);
    }
  };

  const hide = () => {
    if (layer) {
      const newLayer = layer.clone({ visible: false });
      setLayer(newLayer);
    }
  };

  // useEffect(() => {
  //   console.log(layer)
  // },[layer])

  return { onChangeSelect };
};

export default useWeatherMap;
