import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
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
import dayjs, { Dayjs } from 'dayjs';
Chart.register(LineElement, PointElement, LinearScale, TimeScale, Legend);
import { WeatherMapRow } from '@/store/PanelState';
import { GraphType } from './WeatherMapPanel';

type Props = {
  graphType: GraphType;
  dateRows: { date: Dayjs; row: WeatherMapRow }[];
};

/**
 * 気象データマッピンググラフ
 */
const WeatherMapChart = (props: Props) => {
  const [chartData, setChartData] = useState<{ x: Dayjs; y: number }[]>([]);
  useEffect(() => {
    const data = props.dateRows.map<{ x: dayjs.Dayjs; y: number }>((v) => {
      return { x: v.date, y: getValue(props.graphType, v.row) };
    });
    setChartData(data);
  }, [props.graphType, props.dateRows]);

  const getValue = (graphType: GraphType, row: WeatherMapRow) => {
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
    },
  };

  const data: ChartData<'line', { x: dayjs.Dayjs; y: number }[]> = {
    labels: [],
    datasets: [
      {
        backgroundColor: 'rgb(9, 98, 155)',
        borderColor: 'rgb(9, 98, 155)',
        data: chartData,
      },
    ],
  };

  const getTitle = (graphType: GraphType) => {
    if (graphType === 'TEMPERATURE') return '気温の推移';
    if (graphType === 'RELATIVE_HUMIDITY') return '湿度の推移';
    if (graphType === 'LUMINOSITY') return '照度の推移';
    if (graphType === 'RAINFALL') return '降水量の推移';
    if (graphType === 'ATOMSPHERIC_PRESSURE') return '気圧の推移';
  };

  return (
    <>
      <div className="text-center">{getTitle(props.graphType)}</div>
      <Line data={data} options={options} />
    </>
  );
};

export default WeatherMapChart;
