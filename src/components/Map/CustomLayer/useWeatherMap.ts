import { useEffect } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { useRouter } from 'next/router';
import { useRecoilState, useRecoilValue } from 'recoil';
import { WeatherMapState } from '@/store/LayersState';
import { Feature, Point } from 'geojson';
import { usePreferences } from '@/components/LayerFilter/loader';
import { Layer } from '@deck.gl/core/typed';
import { ViewState } from '@/store/ViewState';

/**
 * 気象データマッピングの列データ
 */
export type WeatherMapRow = {
  date: string;
  temperature: number;
  relativeHumidity: number;
  luminosity: number;
  rainfall: number;
  windVelocity: number;
  windDiraction: string;
  atmosphericPressure: number;
};

/**
 * 気象データマッピングフック
 */
const useWeatherMap = (weatherMapLayerId: string) => {
  const router = useRouter();
  const subDirectoryPath = router.basePath;
  const { preferences } = usePreferences();
  const viewState = useRecoilValue(ViewState);
  const [weatherMap, setWeatherMap] = useRecoilState(WeatherMapState);

  // レイヤー初期表示設定
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

  // zoomLevel変更によるレイヤーの表示変更
  useEffect(() => {
    if (weatherMap.layer === undefined) return;
    const newLayer = getVisibleLayer(weatherMap.layer, weatherMap.layer.props.show);
    setWeatherMap({ ...weatherMap, layer: newLayer });
  }, [viewState]);

  const onChangeSelect = (layerId: string, selected: boolean) => {
    if (layerId !== weatherMapLayerId) {
      return;
    }
    selected ? show() : hide();
  };

  const onIconClick = () => {
    console.log(weatherMap);
    if (!weatherMap.layer) return;
    weatherMap.showPanel ? hidePanel() : showPanel();
    console.log('weather_map_marker_clicked.');
  };

  const show = () => {
    if (weatherMap.layer) {
      const newLayer = getVisibleLayer(weatherMap.layer, true);
      setWeatherMap({ ...weatherMap, layer: newLayer });
    } else {
      const newLayer = new GeoJsonLayer<Feature<Point>, { minzoom: number; show: boolean }>({
        id: weatherMapLayerId,
        pointType: 'icon',
        stroked: true,
        filled: true,
        data: `${subDirectoryPath}/data/weather_mapping.geojson`,
        visible: true,
        pickable: true,
        onClick: onIconClick,
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
      setWeatherMap({ ...weatherMap, layer: newLayer });

      // データをロード
      fetch(`${subDirectoryPath}/data/weather_mapping.jsonl`)
        .then((data) => data.text())
        .then((t) => {
          const result = t
            .split('\n')
            .filter((json) => json.length > 0)
            .map((json) => {
              return JSON.parse(json) as WeatherMapRow;
            });
          setWeatherMap({
            ...weatherMap,
            data: result,
          });
        });
    }
  };

  const hide = () => {
    if (weatherMap.layer) {
      const newLayer = getVisibleLayer(weatherMap.layer, false);
      setWeatherMap({ ...weatherMap, layer: newLayer });
    }
  };

  const getVisibleLayer = (layer: Layer<{ minzoom: number; show: boolean }>, show: boolean) => {
    if (!show) return layer.clone({ visible: false, show });
    const visible = layer.props.minzoom <= viewState.zoom;
    return layer.clone({ visible, show });
  };

  const showPanel = () => {
    console.log('showPanel');
    console.log(weatherMap.layer);
    setWeatherMap({
      ...weatherMap,
      showPanel: true,
    });
  };

  const hidePanel = () => {
    console.log('hidePanel');
    setWeatherMap({
      ...weatherMap,
      showPanel: false,
    });
  };

  return { onChangeSelect };
};

export default useWeatherMap;
