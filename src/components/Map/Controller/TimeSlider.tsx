import { memo, useCallback, useEffect, useRef, useState, useContext, VFC } from 'react';
import { context } from '@/pages';
import Slider from 'react-rangeslider';
import { addRenderOption } from '@/components/Map/Layer/renderOption';
import { makeTemporalLayer } from '../Layer/temporalLayerMaker';
import { useRecoilState, useRecoilValue } from 'recoil';
import { TemporalLayerConfigState, TemporalLayerState } from '@/store/LayersState';

export const TimeSlider: VFC = memo(function TimeSlider() {
  const temporalLayerConfigs = useRecoilValue(TemporalLayerConfigState);
  const [temporalLayers, setTemporalLayers] = useRecoilState(TemporalLayerState);
  const [timestamp, setTimestamp] = useState<number>(() => {
    // 時間初期値
    const dateNow = new Date();
    const hr = dateNow.getHours();
    const mn = dateNow.getMinutes();

    return hr * 60 + mn; // 経過分数;
  });
  const [play, setPlay] = useState<boolean>(false);

  const requestRef = useRef<ReturnType<typeof requestAnimationFrame>>();

  const { checkedLayerTitleList } = useContext(context);
  const { preferences } = useContext(context);

  /* jsonからプロパティの取得 設定されていない場合は元々のタイムスライダーの値をセット */
  const maxVal = 1439;
  const speed = 0;
  const labels = {
    0: '0',
    180: '3',
    360: '6',
    540: '9',
    720: '12',
    900: '15',
    1080: '18',
    1260: '21',
    1439: '24',
  };

  // callback関数に変更があった場合のみanimateを再生成する
  const animate = useCallback(() => {
    setTimestamp((prevState) => {
      if (prevState >= maxVal) {
        setTemporalLayers(() =>
          temporalLayerConfigs.map((lc) =>
            addRenderOption(makeTemporalLayer(lc, 0, checkedLayerTitleList, preferences.menu))
          )
        );

        return 0;
      }
      setTemporalLayers(() => {
        return temporalLayerConfigs.map((lc) =>
          addRenderOption(
            makeTemporalLayer(lc, prevState + (1 + speed), checkedLayerTitleList, preferences.menu)
          )
        );
      });
      return prevState + (1 + speed);
    });
    requestRef.current = requestAnimationFrame(animate);
  }, [setTemporalLayers, temporalLayerConfigs, checkedLayerTitleList, preferences.menu]);

  // animate関数に変更があった場合は一度破棄して再度呼び出す
  useEffect(() => {
    if (play) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) {
        return cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, play]);
  const getDisplayTime = (ts) => {
    return `${('0' + Math.floor(ts / 60)).slice(-2)}:${('0' + Math.floor(ts % 60)).slice(-2)}`;
  };

  useEffect(() => {
    setTemporalLayers(() => {
      return temporalLayerConfigs.map((lc) =>
        addRenderOption(makeTemporalLayer(lc, timestamp, checkedLayerTitleList, preferences.menu))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTemporalLayers, temporalLayerConfigs]);

  // unmount時に正常に処理が行われるように
  useEffect(() => {
    return () => {
      setTemporalLayers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={'mx-4 my-4'}>
      <div className={''}>
        <Slider
          value={timestamp}
          format={(value) => {
            return getDisplayTime(value);
          }}
          onChange={(value) => {
            setTemporalLayers(() =>
              temporalLayerConfigs.map((lc) =>
                addRenderOption(
                  makeTemporalLayer(lc, value, checkedLayerTitleList, preferences.menu)
                )
              )
            );
            setTimestamp(value);
          }}
          orientation="horizontal"
          min={0}
          labels={labels}
          max={maxVal}
        />
      </div>
      <div className={'flex p-1 items-center'}>
        <p className={'font-bold text-2xl'}>時刻 : {getDisplayTime(timestamp)}</p>
        <button
          className="bg-gray-500 text-sm text-white rounded px-2.5 py-2 ml-4 mr-1 w-8"
          onClick={() => {
            setPlay((prevState) => {
              return !prevState;
            });
          }}
        >
          {play ? (
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="pause"
              className="svg-inline--fa fa-pause fa-w-14"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="play"
              className="svg-inline--fa fa-play fa-w-14"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});
