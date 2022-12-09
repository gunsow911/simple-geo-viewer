import { useEffect, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { useRouter } from 'next/router';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { LayersState, WeatherMapLayerState } from '@/store/LayersState';
import { Feature, Point } from 'geojson';
import { usePreferences } from '@/components/LayerFilter/loader';
import { Layer } from '@deck.gl/core/typed';
import { ViewState } from '@/store/ViewState';

/**
 * 気象データマッピングフック
 */
const useWeatherMap = (weatherMapLayerId: string) => {
  const router = useRouter();
  const subDirectoryPath = router.basePath;
  const [layer, setLayer] = useRecoilState(WeatherMapLayerState);
  const { preferences } = usePreferences();
  const viewState = useRecoilValue(ViewState);

  useEffect(() => {
    if (!preferences) return;
    const initVisible =
      preferences.menu
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
  }, [preferences]);

  useEffect(() => {
    if (layer === undefined) {
      return;
    }
    const newLayer = getVisibleLayer(layer, layer.props.show);
    setLayer(newLayer);
  }, [viewState]);

  const onChangeSelect = (layerId: string, selected: boolean) => {
    if (layerId !== weatherMapLayerId) {
      return;
    }
    selected ? show() : hide();
  };

  const show = () => {
    if (layer) {
      const newLayer = getVisibleLayer(layer, true);
      setLayer(newLayer);
    } else {
      const newLayer = new GeoJsonLayer<Feature<Point>, { minzoom: number; show: boolean }>({
        id: weatherMapLayerId,
        pointType: 'icon',
        stroked: true,
        filled: true,
        data: `${subDirectoryPath}/data/weather_mapping.geojson`,
        visible: true,
        pickable: true,
        onClick: () => {
          console.log('weather_map_marker_clicked.');
        },
        getIcon: (_) => ({
          url: `${subDirectoryPath}/images/airport_blue.png`,
          width: 64,
          height: 64,
          anchorY: 64,
          mask: false,
        }),
        iconSizeScale: 60,
        autoHighlight: true,
        minzoom: 12,
        show: true,
      });
      setLayer(newLayer);
    }
  };

  const hide = () => {
    if (layer) {
      const newLayer = getVisibleLayer(layer, false);
      setLayer(newLayer);
    }
  };

  const getVisibleLayer = (layer: Layer<{ minzoom: number; show: boolean }>, show: boolean) => {
    if (!show) return layer.clone({ visible: false, show });
    const visible = layer.props.minzoom <= viewState.zoom;
    return layer.clone({ visible, show });
  };

  return { onChangeSelect };
};

export default useWeatherMap;
