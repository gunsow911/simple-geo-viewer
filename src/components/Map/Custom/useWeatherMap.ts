import { useEffect } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { useRouter } from 'next/router';
import { useRecoilState, useRecoilValue } from 'recoil';
import { WeatherMapLayerState, CustomLayerProperty } from '@/store/LayersState';
import { Feature, Point } from 'geojson';
import { usePreferences } from '@/components/LayerFilter/loader';
import { Layer, PickingInfo } from '@deck.gl/core/typed';
import { ViewState } from '@/store/ViewState';
import { WeatherMapPanelState, BaseInformationProperty, WeatherMapRow } from '@/store/PanelState';

/**
 * 気象データマッピングフック
 */
const useWeatherMap = (weatherMapLayerId: string) => {
  const router = useRouter();
  const subDirectoryPath = router.basePath;
  const { preferences } = usePreferences();
  const viewState = useRecoilValue(ViewState);
  const [weatherMapLayer, setWeatherMapLayer] = useRecoilState(WeatherMapLayerState);
  const [weatherMapPanel, setWeatherMapPanel] = useRecoilState(WeatherMapPanelState);

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
    if (weatherMapLayer === undefined) return;
    const newLayer = getVisibleLayer(weatherMapLayer, weatherMapLayer.props.show);
    setWeatherMapLayer(newLayer);
  }, [viewState]);

  const onChangeSelect = (layerId: string, selected: boolean) => {
    if (layerId !== weatherMapLayerId) {
      return;
    }
    selected ? show() : hide();
  };

  const onIconClick = (pickingInfo: PickingInfo) => {
    if (!weatherMapPanel.show)
      showPanel(pickingInfo.object as Feature<Point, BaseInformationProperty>);
  };

  const show = () => {
    if (weatherMapLayer) {
      const newLayer = getVisibleLayer(weatherMapLayer, true);
      setWeatherMapLayer(newLayer);
    } else {
      const newLayer = new GeoJsonLayer<Feature<Point>, CustomLayerProperty>({
        id: weatherMapLayerId,
        pointType: 'icon',
        stroked: true,
        filled: true,
        data: `${subDirectoryPath}/data/weather_mapping.geojson`,
        visible: true,
        pickable: true,
        onClick: onIconClick,
        getIcon: () => ({
          url: `${subDirectoryPath}/images/marker-green.png`,
          width: 64,
          height: 64,
          anchorY: 64,
          mask: false,
        }),
        iconSizeScale: 60,
        autoHighlight: true,
        minzoom: 12,
        show: true,
        downloadUrl: `${subDirectoryPath}/data/weather_data_mapping.csv`,
      });
      setWeatherMapLayer(newLayer);

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

          setWeatherMapPanel((curr) => ({
            ...curr,
            data: result,
          }));
        });
    }
  };

  const hide = () => {
    if (weatherMapLayer) {
      const newLayer = getVisibleLayer(weatherMapLayer, false);
      setWeatherMapLayer(newLayer);
    }
  };

  const getVisibleLayer = (layer: Layer<CustomLayerProperty>, show: boolean) => {
    if (!show) return layer.clone({ visible: false, show });
    const visible = layer.props.minzoom <= viewState.zoom;
    return layer.clone({ visible, show });
  };

  const showPanel = (feature: Feature<Point, BaseInformationProperty>) => {
    setWeatherMapPanel((curr) => ({
      ...curr,
      donwloadUrl: `${subDirectoryPath}/data/weather_data_mapping.csv`,
      show: true,
      feature,
    }));
  };

  return { onChangeSelect };
};

export default useWeatherMap;
