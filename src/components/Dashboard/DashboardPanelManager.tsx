import React from 'react';
import TuMeshVolumePanel from './Menu/TuMeshVolume/TuMeshVolumePanel';
import { useDashboardContext } from './useDashboardContext';

/**
 * ダッシュボードのパネル機能のマネージャ
 * どのメニューのパネルを利用するか制御する
 */
const DashboardPanelManager = () => {
  const { selectedMenuId } = useDashboardContext();

  if (selectedMenuId === 'tu-mesh-volume') {
    return <TuMeshVolumePanel />;
  }

  return <></>;
};

export default DashboardPanelManager;
