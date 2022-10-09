import React from 'react';
import LinkVolumePanel from './Menu/LinkVolume/LinkVolumePanel';
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
  if (selectedMenuId === 'link-volume') {
    return <LinkVolumePanel />;
  }

  return <></>;
};

export default DashboardPanelManager;
