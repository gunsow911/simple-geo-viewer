import React, { useEffect } from 'react';
import settings from '@/assets/settings.json';
import { MenuItem } from './MenuItemList';
import { useDashboardContext } from '../useDashboardContext';

const DashboardMenu = () => {
  const { menuItems, selectedMenuId, show, hide, layers } = useDashboardContext();

  const backgroundStyle = {
    backgroundColor: settings.background_color,
  };

  const onMenuItemClick = (id: string) => {
    if (selectedMenuId === id) {
      hide();
    } else {
      show(id);
    }
  };

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
                  <a className="text-white" href="#" onClick={() => onMenuItemClick(sub.id)}>
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
          onClick={() => onMenuItemClick(item.id)}
        >
          {item.name}
        </a>
      </li>
    );
  };

  return <ul className="flex text-sm">{menuItems.map(generateMenu)}</ul>;
};

export default DashboardMenu;
