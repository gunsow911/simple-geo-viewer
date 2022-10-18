import React, { useMemo } from 'react';
import { useDashboardContext } from '../../useDashboardContext';
import { SbMeshVolumeInfo } from './useSbMeshVolume';
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

/**
 * ソフトバンクメッシュ人口パネル
 */
const SbMeshVolumePanel = () => {
  const { menuInfo, hide } = useDashboardContext();
  const info = menuInfo as SbMeshVolumeInfo | undefined;

  const volumeData = useMemo(() => {
    if (!info) return [];
    const today = dayjs.utc().hour(0).minute(0).second(0);
    return (
      info.volumes?.map((volume, index) => {
        const hour = today.add(index * 6, 'minutes');
        return { x: hour, y: volume };
      }) ?? []
    );
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
          <div className="absolute top-1 right-1">
            <CloseButton onClick={() => hide()} />
          </div>
          <div className="text-lg">メッシュ人口</div>
          <div>地図をクリックすると、そのメッシュ内の人口グラフが表示されます。</div>
          {info.selectedCode && <Bar data={data} options={options} />}
        </div>
      )}
    </>
  );
};

export default SbMeshVolumePanel;
