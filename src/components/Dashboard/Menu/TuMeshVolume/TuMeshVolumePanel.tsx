import React, { useEffect, useState } from 'react';
import { useDashboardContext } from '../../useDashboardContext';
import { TuMeshVolumeInfo } from './useTuMeshVolume';

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

  const { menuInfo } = useDashboardContext();
  const [date, setDate] = useState<string>('2019-10-13');
  const info = menuInfo as TuMeshVolumeInfo | undefined;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDate(e.target.value);
    if (!info) return;
    info.setDate(e.target.value);
  };

  return (
    <>
      {info && (
        <div className="z-10 absolute top-2 left-2 bg-white p-2 opacity-80">
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
          {info.selectedCode ? <div className="">{info.selectedCode}</div> : <></>}
        </div>
      )}
    </>
  );
};

export default TuMeshVolumePanel;
