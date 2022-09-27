import React from 'react';
import settings from '@/assets/settings.json';

type MenuItem = {
  id: string;
  name: string;
  subList?: {
    id: string;
    name: string;
  }[];
};

const DashboardMenu = () => {
  const backgroundStyle = {
    backgroundColor: settings.background_color,
  };

  const menuList: MenuItem[] = [
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

  const generateMenu = (item: MenuItem) => {
    return item.subList ? (
      <>
        <div className="flex-col">
          <button className="peer mr-1 py-1 px-3" style={backgroundStyle}>
            <span className="mr-1 text-white">{item.name}</span>
          </button>
          <div className="hidden absolute peer-hover:flex hover:flex z-50 flex-col">
            {item.subList.map((sub) => {
              return (
                <div key={sub.id} className="py-1 px-3" style={backgroundStyle}>
                  <a className="text-white" href="#">
                    {sub.name}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </>
    ) : (
      <li key={item.id} className="mr-1">
        <a
          className="block whitespace-no-wrap py-1 px-3 text-white"
          href="#"
          style={backgroundStyle}
        >
          {item.name}
        </a>
      </li>
    );
  };

  // return (
  // <div className="dropdown inline-block relative">
  //   <button className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center">
  //     <span className="mr-1">Dropdown</span>
  //     <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
  //   </button>
  //   <ul className="dropdown-menu absolute hidden text-gray-700 pt-1">
  //     <li className=""><a className="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">One</a></li>
  //     <li className=""><a className="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">Two</a></li>
  //     <li className=""><a className="rounded-b bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">Three is the magic number</a></li>
  //   </ul>
  // </div>
  // )

  return <ul className="flex text-sm">{menuList.map(generateMenu)}</ul>;
};

export default DashboardMenu;
