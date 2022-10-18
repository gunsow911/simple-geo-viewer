export type Item = {
  id: string;
  name: string;
  disabled?: boolean;
};

export type MenuItem = {
  subList?: Item[];
} & Item;

/**
 * メニューアイテム一覧を取得
 */
export const getMenuItems = (): Promise<MenuItem[]> => {
  const menuItems = fetch('/dashboard/preferences/menu.json')
    .then((res) => res.json())
    .then((json) => json as MenuItem[]);
  return menuItems;
};
