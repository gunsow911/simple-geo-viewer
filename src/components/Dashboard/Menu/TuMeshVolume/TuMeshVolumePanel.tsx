import React, { useMemo, useState } from 'react';
import { useDashboardContext } from '../../useDashboardContext';
import { TuMeshVolumeInfo } from './useTuMeshVolume';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  ChartData,
  ChartOptions,
  BarElement,
  LinearScale,
  TimeScale,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import 'chartjs-adapter-dayjs';
import CloseButton from '@/components/Utils/CloseButton';
Chart.register(BarElement, LinearScale, TimeScale, Legend);

type DateSelectList = {
  [key: string]: string;
};

/**
 *
 * 東京大学メッシュ人口パネル
 */
const TuMeshVolumePanel = () => {
  const dateSelectList: DateSelectList = {
    '2019-10-13': '2019年10月13日(月)',
    '2019-10-14': '2019年10月14日(火)',
    '2019-10-15': '2019年10月15日(水)',
    '2019-10-16': '2019年10月16日(木)',
    '2019-10-17': '2019年10月17日(金)',
    '2019-10-18': '2019年10月18日(土)',
    '2019-10-19': '2019年10月19日(日)',
    '2020-10-11': '2020年10月11日(日)',
    '2020-10-12': '2020年10月12日(月)',
    '2020-10-13': '2020年10月13日(火)',
    '2020-10-14': '2020年10月14日(水)',
    '2020-10-15': '2020年10月15日(木)',
    '2020-10-16': '2020年10月16日(金)',
    '2020-10-17': '2020年10月17日(土)',
  };

  const { menuInfo, hide } = useDashboardContext();
  const [date, setDate] = useState<string>();
  const info = menuInfo as TuMeshVolumeInfo | undefined;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDate(e.target.value);
    if (!info) return;
    info.onChangeDate(e.target.value);
  };

  const labelData = useMemo(() => {
    if (!info) return [];
    return info.volumes.map((v) => dayjs(v.d).format('YYYY-MM-DD HH:mm'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.volumes]);

  const volumeData = useMemo(() => {
    if (!info) return [];
    return info.volumes.map((v) => Number.parseFloat(v.a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.volumes]);

  const options: ChartOptions<'bar'> = {
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
        min: '00:00',
        max: '24:00',
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

  const data: ChartData<'bar'> = {
    labels: labelData,
    datasets: [
      {
        backgroundColor: 'rgb(9, 98, 155)',
        borderColor: 'rgb(9, 98, 155)',
        data: volumeData,
      },
    ],
  };

  return (
    <>
      {info && (
        <div className="z-10 absolute top-2 left-2 bg-white p-2 opacity-80">
          <div className="absolute top-1 right-1">
            <CloseButton onClick={() => hide()} />
          </div>
          <div className="text-lg">メッシュ人口</div>
          <div>地図をクリックすると、そのメッシュ内の人口グラフが表示されます。</div>
          <select value={date} onChange={onChange}>
            {Object.keys(dateSelectList).map((key) => {
              return (
                <option key={key} value={key}>
                  {dateSelectList[key]}
                </option>
              );
            })}
          </select>
          {info.selectedCode && <Bar data={data} options={options} />}
        </div>
      )}
    </>
  );
};

export default TuMeshVolumePanel;
