import { useEffect, useState } from 'react';
import { getMenuItems, MenuItem } from '@/components/Dashboard/Menu/MenuItemList';
import { Layer } from '@deck.gl/core/typed';
import { DashboardAsset, UseMenuReturn } from './Menu/DashboardAsset';
import useLinkVolume from './Menu/LinkVolume/useLinkVolume';
import useTuMeshVolume from './Menu/TuMeshVolume/useTuMeshVolume';
import useSbMeshVolume from './Menu/SbMeshVolume/useSbMeshVolume';

// ダッシュボード専用レイヤープロパティ
export type DashboardLayerProps = {
  dashboardMenuId?: string;
};

// ダッシュボードフック返却値
export type UseDashboardReturn = {
  /**
   * メニューアイテムリスト
   */
  menuItems: MenuItem[];
  /**
   * 選択中のメニュー情報
   * 各種メニューコンポーネントで適宜キャストを行う
   * 選択していない場合、undefined
   */
  menuInfo?: any;
  /**
   * 選択中のメニューID
   */
  selectedMenuId?: string;
  /**
   * ダッシュボードが所持しているレイヤーリスト
   */
  layers: Layer[];
  /**
   * メニューのダッシュボードを表示させる
   * @param menuId メニューID
   */
  show: (menuId: string) => void;
  /**
   * メニューのダッシュボードを非表示にさせる
   */
  hide: () => void;
};

/**
 * ダッシュボードフック
 * ダッシュボード全体のデータを提供する
 */
const useDashboard = (): UseDashboardReturn => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>();
  const [layers, setLayers] = useState<Layer<DashboardLayerProps>[]>([]);
  const [menuInfo, setMenuInfo] = useState<any | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // メニューフックリスト
  const menuList: UseMenuReturn[] = [
    useSbMeshVolume({ maxVolume: 300 }),
    useTuMeshVolume({ maxVolume: 300 }),
    useLinkVolume({ maxVolume: 300 }),
  ];

  // メニュー設定をロード
  useEffect(() => {
    getMenuItems().then(setMenuItems);
  }, []);

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
