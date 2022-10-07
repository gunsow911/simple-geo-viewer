import React from 'react';
import { useDashboardContext } from '../../useDashboardContext';
import { TuMeshVolumeInfo } from './useTuMeshVolume';

/**
 *
 * 東京大学メッシュ人口パネル
 */
const TuMeshVolumePanel = () => {
  const { menuInfo } = useDashboardContext();

  const info = menuInfo as TuMeshVolumeInfo | undefined;

  return (
    <>
      {info && (
        <div className="z-10 absolute top-2 left-2 bg-white p-2 opacity-80">
          <div className="text-lg">メッシュ人口</div>
          <div>地図をクリックすると、そのメッシュ内の人口グラフが表示されます。</div>
          <select>
            {Object.keys(info.dateSelectList).map((key) => {
              return <option key={key}>{info.dateSelectList[key]}</option>;
            })}
          </select>
          {info.selectedCode ? <div className="">{info.selectedCode}</div> : <></>}
        </div>
      )}
    </>
  );
};

export default TuMeshVolumePanel;
