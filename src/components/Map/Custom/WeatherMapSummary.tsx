import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Dayjs } from 'dayjs';
import { WeatherMapRow } from '@/store/PanelState';

type WeatherMapSummary = {
  averageTemperature: number;
  averageRelativeHumidity: number;
  averageLuminosity: number;
  averageRainfall: number;
  averageAtomsphericPressure: number;
};

type Props = {
  dateRows: { date: Dayjs; row: WeatherMapRow }[];
};

/**
 * 気象データマッピング要約
 */
const WeatherMapSummary = (props: Props) => {
  const [summary, setSummary] = useState<WeatherMapSummary>();

  useEffect(() => {
    const averageTemperature = getAverage(props.dateRows.map((v) => v.row.temperature));
    const averageRelativeHumidity = getAverage(props.dateRows.map((v) => v.row.relativeHumidity));
    const averageLuminosity = getAverage(props.dateRows.map((v) => v.row.luminosity));
    const averageRainfall = getAverage(props.dateRows.map((v) => v.row.rainfall));
    const averageAtomsphericPressure = getAverage(
      props.dateRows.map((v) => v.row.atmosphericPressure)
    );

    setSummary({
      averageTemperature,
      averageRelativeHumidity,
      averageLuminosity,
      averageRainfall,
      averageAtomsphericPressure,
    });
  }, [props.dateRows]);

  const getAverage = (values: number[]) => {
    return (
      values.reduce((prev, curr) => {
        return prev + curr;
      }, 0) / (values.length !== 0 ? values.length : 1)
    );
  };

  return (
    <>
      <div className="border p-1 m-1">
        <div>平均気温</div>
        <div>{summary?.averageTemperature.toFixed(1)} ℃</div>
      </div>
      <div className="border p-1 m-1">
        <div>平均湿度</div>
        <div>{summary?.averageRelativeHumidity.toFixed(0)} ％</div>
      </div>
      <div className="border p-1 m-1">
        <div>平均照度</div>
        <div>{summary?.averageLuminosity.toFixed(0)} lx</div>
      </div>
      <div className="border p-1 m-1">
        <div>平均降水量</div>
        <div>{summary?.averageRainfall.toFixed(1)} mm</div>
      </div>
      <div className="border p-1 m-1">
        <div>平均気圧</div>
        <div>{summary?.averageAtomsphericPressure.toFixed(1)} hPa</div>
      </div>
    </>
  );
};

export default WeatherMapSummary;
