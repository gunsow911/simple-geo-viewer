import React, { useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { GraphType } from './WeatherMapPanel';
import { DatePicker } from '@/components/Utils/DataPicker';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type Props = {
  graphType?: GraphType;
  date?: Dayjs;
  onChangeGraphType?: (graphType: GraphType) => void;
  onChangeDate?: (date: Dayjs) => void;
};

/**
 * 気象データコントロールコンポーネント
 */
const WeatherMapControl = (props: Props) => {
  const selectedBgColor = useMemo(() => {
    return `bg-[#17a2b8]`;
  }, []);

  const selectedTextColor = useMemo(() => {
    return `text-white`;
  }, []);

  return (
    <>
      <div className="justify-center flex">
        <button
          className={`border px-2 mx-1 ${
            props.graphType === 'TEMPERATURE' ? `${selectedBgColor} ${selectedTextColor}` : ''
          }`}
          onClick={() => props.onChangeGraphType && props.onChangeGraphType('TEMPERATURE')}
        >
          気温
        </button>
        <button
          className={`border px-2 mx-1 ${
            props.graphType === 'RELATIVE_HUMIDITY' ? `${selectedBgColor} ${selectedTextColor}` : ''
          }`}
          onClick={() => props.onChangeGraphType && props.onChangeGraphType('RELATIVE_HUMIDITY')}
        >
          湿度
        </button>
        <button
          className={`border px-2 mx-1 ${
            props.graphType === 'LUMINOSITY' ? `${selectedBgColor} ${selectedTextColor}` : ''
          }`}
          onClick={() => props.onChangeGraphType && props.onChangeGraphType('LUMINOSITY')}
        >
          照度
        </button>
        <button
          className={`border px-2 mx-1 ${
            props.graphType === 'RAINFALL' ? `${selectedBgColor} ${selectedTextColor}` : ''
          }`}
          onClick={() => props.onChangeGraphType && props.onChangeGraphType('RAINFALL')}
        >
          降水量
        </button>
        <button
          className={`border px-2 mx-1 ${
            props.graphType === 'ATOMSPHERIC_PRESSURE'
              ? `${selectedBgColor} ${selectedTextColor}`
              : ''
          }`}
          onClick={() => props.onChangeGraphType && props.onChangeGraphType('ATOMSPHERIC_PRESSURE')}
        >
          気圧
        </button>
      </div>
      <div className="py-1 justify-center flex">
        <div className="flex">
          <span className="pr-2 my-auto">日付</span>
          <button
            className="px-2 mx-1 border"
            onClick={() => {
              const prev = dayjs.utc(props.date).add(-1, 'day');
              props.onChangeDate && props.onChangeDate(prev);
            }}
          >
            &lt;
          </button>
          <DatePicker
            className="border text-center"
            selected={dayjs.utc(props.date).toDate()}
            onChange={(date: Date) => {
              props.onChangeDate && props.onChangeDate(dayjs.utc(date));
            }}
            dateFormat="yyyy年M月d日"
            calendarStartDay={1}
            minDate={dayjs.utc('2022-09-01').toDate()}
            maxDate={dayjs.utc('2022-10-17').toDate()}
          ></DatePicker>
          <button
            className="px-2 mx-1 border"
            onClick={() => {
              const next = dayjs.utc(props.date).add(1, 'day');
              props.onChangeDate && props.onChangeDate(next);
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </>
  );
};

export default WeatherMapControl;
