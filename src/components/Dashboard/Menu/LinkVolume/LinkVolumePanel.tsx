import React, { useMemo, useState } from 'react';
import { useDashboardContext } from '../../useDashboardContext';
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
import 'chartjs-adapter-dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { LinkVolumeInfo } from './useLinkVolume';
Chart.register(BarElement, LinearScale, TimeScale, Legend);

dayjs.locale('ja');

/**
 *
 * リンク通行量パネル
 */
const LinkVolumePanel = () => {
  const { menuInfo } = useDashboardContext();
  const info = menuInfo as LinkVolumeInfo | undefined;

  const volumeData = useMemo(() => {
    if (!info) return [];
    const today = dayjs().hour(0).minute(0).second(0);
    console.log(today);
    return info.volumes.map((volume, index) => {
      console.log(today.add(index, 'hours'));
      return { x: today.add(index, 'hours'), y: volume };
    });
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

  const data: ChartData<'bar', { x: dayjs.Dayjs; y: number }[]> = {
    labels: [],
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
          <div className="text-lg">時間あたり通行人数推定</div>
          <div>路線をクリックすると、その路線内の予測グラフが表示されます。</div>
          {info.selectedLinkId && <Bar data={data} options={options} />}
        </div>
      )}
    </>
  );
};

export default LinkVolumePanel;
