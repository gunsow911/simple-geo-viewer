export type MenuItem = {
  id: string;
  name: string;
  subList?: {
    id: string;
    name: string;
  }[];
};

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
    },
    {
      id: 'link-volume',
      name: '通行人数推定',
    },
    {
      id: 'buy-pattern',
      name: '購買パターン',
    },
    {
      id: 'business-activity',
      name: '企業活動',
    },
    {
      id: 'enviroment-load',
      name: '環境・エネルギー負荷',
    },
  ];
};
