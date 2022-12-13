import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { WeatherMapState } from '@/store/LayersState';
import CloseButton from '@/components/Utils/CloseButton';
import 'react-datepicker/dist/react-datepicker.css';
import Draggable from 'react-draggable';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  ChartData,
  ChartOptions,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-dayjs';
import dayjs from 'dayjs';
import { WeatherMapRow } from './useWeatherMap';
Chart.register(LineElement, PointElement, LinearScale, TimeScale, Legend);
import utc from 'dayjs/plugin/utc';
import { DatePicker } from '@/components/Utils/DataPicker';
dayjs.extend(utc);

type GraphType =
  | 'TEMPERATURE'
  | 'RELATIVE_HUMIDITY'
  | 'LUMINOSITY'
  | 'RAINFALL'
  | 'ATOMSPHERIC_PRESSURE';

type WeatherMapSummary = {
  averageTemperature: number;
  averageRelativeHumidity: number;
  averageLuminosity: number;
  averageRainfall: number;
  averageAtomsphericPressure: number;
};

/**
 * 気象データマッピングパネル
 */
const WeatherMapPanel = () => {
  const [weatherMap, setWeatherMap] = useRecoilState(WeatherMapState);
  const [volumeData, setVolumeData] = useState<{ x: dayjs.Dayjs; y: number }[]>([]);
  const [graphType, setGraphType] = useState<GraphType>();
  const [betweenDate, setBetweenDate] = useState<{ start: string; end: string }>({
    start: '2022-09-01',
    end: '2022-09-01',
  });
  const [summary, setSummary] = useState<WeatherMapSummary>();

  const selectedBgColor = useMemo(() => {
    return `bg-[#17a2b8]`;
  }, []);

  const selectedTextColor = useMemo(() => {
    return `text-white`;
  }, []);

  const hide = () => {
    setWeatherMap({
      ...weatherMap,
      showPanel: false,
    });
  };

  useEffect(() => {
    if (!graphType || !betweenDate) return;
    const betweenRows =
      weatherMap.data
        ?.map<{ date: dayjs.Dayjs; value: WeatherMapRow }>((row) => {
          return { date: dayjs.utc(row.date), value: row };
        })
        .filter((v) => {
          return (
            v.date >= dayjs.utc(betweenDate.start).startOf('date') &&
            v.date <= dayjs.utc(betweenDate.end).endOf('date')
          );
        }) ?? [];

    const results = betweenRows.map<{ x: dayjs.Dayjs; y: number }>((v) => {
      return { x: v.date, y: getValue(v.value) };
    });
    setVolumeData(results);

    const averageTemperature = getAverage(betweenRows.map((v) => v.value.temperature));
    const averageRelativeHumidity = getAverage(betweenRows.map((v) => v.value.relativeHumidity));
    const averageLuminosity = getAverage(betweenRows.map((v) => v.value.luminosity));
    const averageRainfall = getAverage(betweenRows.map((v) => v.value.rainfall));
    const averageAtomsphericPressure = getAverage(
      betweenRows.map((v) => v.value.atmosphericPressure)
    );

    setSummary({
      averageTemperature,
      averageRelativeHumidity,
      averageLuminosity,
      averageRainfall,
      averageAtomsphericPressure,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherMap.data, graphType, betweenDate]);

  const getAverage = (values: number[]) => {
    return (
      values.reduce((prev, curr) => {
        return prev + curr;
      }, 0) / (values.length !== 0 ? values.length : 1)
    );
  };

  const getValue = (row: WeatherMapRow) => {
    if (graphType === 'TEMPERATURE') return row.temperature;
    if (graphType === 'RELATIVE_HUMIDITY') return row.relativeHumidity;
    if (graphType === 'LUMINOSITY') return row.luminosity;
    if (graphType === 'RAINFALL') return row.rainfall;
    if (graphType === 'ATOMSPHERIC_PRESSURE') return row.atmosphericPressure;
    return 0;
  };

  const options: ChartOptions<'line'> = {
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    animation: {
      duration: 500,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'H:mm',
          displayFormats: {
            hour: 'H:mm',
          },
        },
      },
      y: {
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  const data: ChartData<'line', { x: dayjs.Dayjs; y: number }[]> = {
    labels: [],
    datasets: [
      {
        backgroundColor: 'rgb(9, 98, 155)',
        borderColor: 'rgb(9, 98, 155)',
        data: volumeData,
      },
    ],
  };

  const getTitle = () => {
    if (graphType === 'TEMPERATURE') return '気温の推移';
    if (graphType === 'RELATIVE_HUMIDITY') return '湿度の推移';
    if (graphType === 'LUMINOSITY') return '照度の推移';
    if (graphType === 'RAINFALL') return '降水量の推移';
    if (graphType === 'ATOMSPHERIC_PRESSURE') return '気圧の推移';
  };

  return (
    <>
      {true && (
        <Draggable cancel=".body">
          <div className="z-10 absolute top-2 left-2">
            <div className={`title p-1 ${selectedBgColor}`}>
              <div className="absolute top-1 right-1">
                <CloseButton onClick={hide} darkmode />
              </div>
              <div className={`${selectedTextColor}`}>ピンポイント気象データ</div>
            </div>
            <div className="body p-1 bg-white opacity-90">
              <div className="py-1 flex">
                <button
                  className={`border px-2 mx-1 ${
                    graphType === 'TEMPERATURE' ? `${selectedBgColor} ${selectedTextColor}` : ''
                  }`}
                  onClick={() => setGraphType('TEMPERATURE')}
                >
                  気温
                </button>
                <button
                  className={`border px-2 mx-1 ${
                    graphType === 'RELATIVE_HUMIDITY'
                      ? `${selectedBgColor} ${selectedTextColor}`
                      : ''
                  }`}
                  onClick={() => setGraphType('RELATIVE_HUMIDITY')}
                >
                  湿度
                </button>
                <button
                  className={`border px-2 mx-1 ${
                    graphType === 'LUMINOSITY' ? `${selectedBgColor} ${selectedTextColor}` : ''
                  }`}
                  onClick={() => setGraphType('LUMINOSITY')}
                >
                  照度
                </button>
                <button
                  className={`border px-2 mx-1 ${
                    graphType === 'RAINFALL' ? `${selectedBgColor} ${selectedTextColor}` : ''
                  }`}
                  onClick={() => setGraphType('RAINFALL')}
                >
                  降水量
                </button>
                <button
                  className={`border px-2 mx-1 ${
                    graphType === 'ATOMSPHERIC_PRESSURE'
                      ? `${selectedBgColor} ${selectedTextColor}`
                      : ''
                  }`}
                  onClick={() => setGraphType('ATOMSPHERIC_PRESSURE')}
                >
                  気圧
                </button>
              </div>
              <div className="py-1">
                <div className="flex">
                  <span className="pr-2">日付選択</span>
                  <button
                    className="px-2 mx-1 border"
                    onClick={() => {
                      const prev = dayjs.utc(betweenDate?.start).add(-1, 'day');
                      setBetweenDate({
                        start: prev.format('YYYY-MM-DD'),
                        end: prev.format('YYYY-MM-DD'),
                      });
                    }}
                  >
                    &lt;
                  </button>
                  <DatePicker
                    className="border text-center"
                    selected={dayjs.utc(betweenDate?.start).toDate()}
                    onChange={(date: Date) => {
                      const dateString = dayjs.utc(date).format('YYYY-MM-DD');
                      setBetweenDate({ start: dateString, end: dateString });
                    }}
                    dateFormat="yyyy年M月d日"
                    calendarStartDay={1}
                    minDate={dayjs.utc('2022-09-01').toDate()}
                    maxDate={dayjs.utc('2022-10-17').toDate()}
                  ></DatePicker>
                  <button
                    className="px-2 mx-1 border"
                    onClick={() => {
                      const next = dayjs.utc(betweenDate?.start).add(1, 'day');
                      setBetweenDate({
                        start: next.format('YYYY-MM-DD'),
                        end: next.format('YYYY-MM-DD'),
                      });
                    }}
                  >
                    &gt;
                  </button>
                </div>
              </div>
              {graphType ? (
                <>
                  <div className="py-1">
                    {getTitle()}
                    <Line data={data} options={options} />
                  </div>

                  <div className="py-1 text-center flex">
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
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default WeatherMapPanel;
