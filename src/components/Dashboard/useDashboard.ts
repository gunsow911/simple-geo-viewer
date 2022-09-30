import { useMemo, useState } from 'react';
import { getMenuItems, MenuItem } from '@/components/Dashboard/Menu/MenuItemList';
import { Layer } from '@deck.gl/core/typed';
import { makeTuMeshVolumeHeatmapLayer } from '@/components/Dashboard/Menu/TuMeshVolume';

// ダッシュボード専用レイヤープロパティ
export type DashboardLayerProps = {
  dashboardMenuId?: string;
};

export type UseDashboardReturn = {
  menuItems: MenuItem[];
  selectedMenuId?: string;
  layers: Layer[];
  show: (menuId: string) => void;
  hide: () => void;
};

const useDashboard = (): UseDashboardReturn => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>();
  const [cachedMenuIdList, setCachedMenuIdList] = useState<string[]>([]);
  const [layers, setLayers] = useState<Layer<DashboardLayerProps>[]>([]);
  const menuItems = useMemo(getMenuItems, []);

  const show = (menuId: string) => {
    setSelectedMenuId(menuId);

    const newLayers: Layer<DashboardLayerProps>[] = [];
    if (!cachedMenuIdList.find((id) => id === menuId)) {
      setCachedMenuIdList([...cachedMenuIdList, menuId]);
      // 簡易ファクトリ
      if (menuId === 'tu-mesh-volume') {
        newLayers.push(makeTuMeshVolumeHeatmapLayer());
      }
    }
    // 選択されたメニューに所属するレイヤーのみ表示
    const updatedLayers = layers.map((layer) => {
      if (layer.props.dashboardMenuId === menuId) {
        return layer.clone({
          visible: true,
        });
      }
      return layer.clone({
        visible: false,
      });
    });

    // レイヤー統合
    setLayers([...updatedLayers, ...newLayers]);
  };

  const hide = () => {
    setSelectedMenuId(undefined);
    const newLayers = layers.map<Layer>((layer) => {
      return layer.clone({
        visible: false,
      });
    });
    setLayers(newLayers);
  };

  return {
    menuItems,
    selectedMenuId,
    layers,
    show,
    hide,
  };
};

export default useDashboard;
