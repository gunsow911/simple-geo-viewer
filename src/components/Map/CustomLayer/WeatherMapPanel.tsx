import React from 'react';
import { useRecoilState } from 'recoil';
import { WeatherMapState } from '@/store/LayersState';
import CloseButton from '@/components/Utils/CloseButton';

/**
 * 気象データマッピングパネル
 */
const WeatherMapPanel = () => {
  const [weatherMap, setWeatherMap] = useRecoilState(WeatherMapState);

  const hide = () => {
    setWeatherMap({
      ...weatherMap,
      showPanel: false,
    });
  };

  return (
    <>
      {true && (
        <div className="z-10 absolute top-2 left-2 bg-white p-2 opacity-80">
          <div className="absolute top-1 right-1">
            <CloseButton onClick={hide} />
          </div>
          <div className="text-lg">気象データマッピング</div>
        </div>
      )}
    </>
  );
};

export default WeatherMapPanel;
