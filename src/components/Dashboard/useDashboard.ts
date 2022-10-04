import { useEffect, useMemo, useRef, useState } from 'react';
import { getMenuItems, MenuItem } from '@/components/Dashboard/Menu/MenuItemList';
import { Layer } from '@deck.gl/core/typed';
import useTuMeshVolume from './Menu/TuMeshVolume/useTuMeshVolume';
import { DashboardAsset, UseMenuReturn } from './Menu/DashboardAsset';

// ダッシュボード専用レイヤープロパティ
export type DashboardLayerProps = {
  dashboardMenuId?: string;
};

// ダッシュボードフック返却値
export type UseDashboardReturn = {
  menuItems: MenuItem[];
  selectedMenuId?: string;
  layers: Layer[];
  show: (menuId: string) => void;
  hide: () => void;
};

const useDashboard = (): UseDashboardReturn => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>();
  const [layers, setLayers] = useState<Layer<DashboardLayerProps>[]>([]);
  const menuItems = useMemo(getMenuItems, []);

  // メニューフックリスト
  const menuList: UseMenuReturn[] = [useTuMeshVolume()];

  // 各メニューのアセットが変化したらレイヤーを更新する
  useEffect(() => {
    const newLayers = menuList
      .map((menu) => menu.asset)
      .filter((asset): asset is DashboardAsset => asset !== undefined)
      .reduce<Layer<DashboardLayerProps>[]>((prev, asset) => {
        prev.push(...asset.layers);
        return prev;
      }, []);
    setLayers(newLayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...menuList.map((menu) => menu.asset)]);

  const show = (menuId: string) => {
    setSelectedMenuId(menuId);
    menuList.forEach((menu) => {
      menuId === menu.menuId ? menu.show() : menu.hide();
    });
  };

  const hide = () => {
    setSelectedMenuId(undefined);
    menuList.forEach((menu) => {
      menu.hide();
    });
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
