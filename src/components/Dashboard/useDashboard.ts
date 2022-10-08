import { ReactNode, useEffect, useMemo, useState } from 'react';
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
  menuInfo: any;
  selectedMenuId?: string;
  layers: Layer[];
  show: (menuId: string) => void;
  hide: () => void;
};

const useDashboard = (): UseDashboardReturn => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>();
  const [layers, setLayers] = useState<Layer<DashboardLayerProps>[]>([]);
  const [menuInfo, setMenuInfo] = useState<any | undefined>(undefined);
  const menuItems = useMemo(getMenuItems, []);

  // メニューフックリスト
  const menuList: UseMenuReturn[] = [useTuMeshVolume()];

  useEffect(() => {
    // 各メニューのアセットの変更を検知

    // レイヤーを更新する
    const newLayers = menuList
      .map((menu) => menu.asset)
      .filter((asset): asset is DashboardAsset => asset !== undefined)
      .reduce<Layer<DashboardLayerProps>[]>((prev, asset) => {
        prev.push(...asset.layers);
        return prev;
      }, []);
    setLayers(newLayers);

    const menu = menuList.find((menu) => menu.menuId === selectedMenuId);
    if (menu) {
      setMenuInfo(menu.asset?.info);
    } else {
      setMenuInfo(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...menuList.map((menu) => menu.asset)]);

  /**
   * メニューを表示させる
   * @param menuId 表示させるメニューID
   */
  const show = (menuId: string) => {
    // menuId以外のmenuを隠す
    setSelectedMenuId(menuId);
    menuList.forEach((menu) => {
      menuId === menu.menuId ? menu.show() : menu.hide();
    });
  };

  /**
   * メニューを隠す
   */
  const hide = () => {
    //全てのmenuを隠す
    setSelectedMenuId(undefined);
    menuList.forEach((menu) => {
      menu.hide();
    });
  };

  return {
    menuItems,
    selectedMenuId,
    menuInfo,
    layers,
    show,
    hide,
  };
};

export default useDashboard;
