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
export const getMenuItems = (): MenuItem[] => {
  return [
    {
      id: 'mesh-volume',
      name: 'メッシュ人口',
      subList: [
        {
          id: 'sb-mesh-volume',
          name: 'ソフトバンクデータ',
          disabled: true,
        },
        {
          id: 'tu-mesh-volume',
          name: '東京大学データ',
        },
      ],
    },
    {
      id: 'origin-destination',
      name: '流動パターン',
      disabled: true,
    },
    {
      id: 'link-volume',
      name: '通行人数推定',
    },
    {
      id: 'buy-pattern',
      name: '購買パターン',
      disabled: true,
    },
    {
      id: 'business-activity',
      name: '企業活動',
      disabled: true,
    },
    {
      id: 'enviroment-load',
      name: '環境・エネルギー負荷',
      disabled: true,
    },
  ];
};
