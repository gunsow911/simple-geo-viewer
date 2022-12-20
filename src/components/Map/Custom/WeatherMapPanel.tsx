import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { WeatherMapPanelState, WeatherMapRow } from '@/store/PanelState';
import BasicInformation from './BasicInformation';
import WeatherMapControl from './WeatherMapControl';
import WeatherMapSummary from './WeatherMapSummary';
import WeatherMapChart from './WeatherMapChart';
import MovableWindowPanel from '@/components/Panel/MovableWindowPanel';

export type GraphType =
  | 'TEMPERATURE'
  | 'RELATIVE_HUMIDITY'
  | 'LUMINOSITY'
  | 'RAINFALL'
  | 'ATOMSPHERIC_PRESSURE';

/**
 * 気象データマッピングパネル
 */
const WeatherMapPanel = () => {
  const [panel, setPanel] = useRecoilState(WeatherMapPanelState);
  const [graphType, setGraphType] = useState<GraphType>();
  const [date, setDate] = useState<Dayjs>(dayjs.utc('2022-09-01'));
  const [dateRows, setDateRows] = useState<{ date: Dayjs; row: WeatherMapRow }[]>([]);

  const hide = () => {
    setPanel((curr) => ({
      ...curr,
      show: false,
      baseInfo: undefined,
      donwloadUrl: undefined,
    }));
    setGraphType(undefined);
    setDateRows([]);
    setDate(dayjs.utc('2022-09-01'));
  };

  useEffect(() => {
    const dateRows =
      panel.data
        ?.map<{ date: dayjs.Dayjs; row: WeatherMapRow }>((_row) => {
          return { date: dayjs.utc(_row.date), row: _row };
        })
        .filter((v) => {
          return v.date >= date.startOf('date') && v.date <= date.endOf('date');
        }) ?? [];
    setDateRows(dateRows);
  }, [panel.data, date]);

  return (
    <>
      {panel.show && (
        <MovableWindowPanel title="ピンポイント気象データ" onClose={hide} darkmode>
          <>
            <div className="py-1">
              {panel.feature && <BasicInformation feature={panel.feature} />}
            </div>
            <div className="py-1 ">
              <WeatherMapControl
                graphType={graphType}
                date={date}
                onChangeGraphType={setGraphType}
                onChangeDate={setDate}
              />
            </div>
            {graphType ? (
              <>
                <div className="py-1">
                  <WeatherMapChart graphType={graphType} dateRows={dateRows} />
                </div>
                <div className="py-1 text-center justify-around flex">
                  <WeatherMapSummary dateRows={dateRows} />
                </div>
              </>
            ) : (
              <div></div>
            )}
          </>
        </MovableWindowPanel>
      )}
    </>
  );
};

export default WeatherMapPanel;
