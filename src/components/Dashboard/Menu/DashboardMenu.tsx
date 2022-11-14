import React from 'react';
import settings from '@/assets/settings.json';
import { Item, MenuItem } from './MenuItemList';
import { useDashboardContext } from '../useDashboardContext';

const DashboardMenu = () => {
  const { menuItems, selectedMenuId, show, hide } = useDashboardContext();

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: settings.background_color,
  };

  const onMenuItemClick = (item: Item) => {
    if (item.disabled) return;
    selectedMenuId === item.id ? hide() : show(item.id);
  };

  const selectedChildrenClass = (subList: Item[]) => {
    const result = subList.reduce((prev, sub) => {
      return prev || selectedClass(sub).length !== 0;
    }, false);
    return result ? 'selected' : '';
  };

  const isDisabled = (item: Item) => {
    return item.disabled === true;
  };

  const selectedClass = (item: Item) => {
    return selectedMenuId === item.id ? 'selected' : '';
  };

  const generateMenu = (item: MenuItem) => {
    return item.subList ? (
      <>
        <div className="flex-col">
          <button
            className={`peer mr-1 py-1 px-3 menuitem ${selectedChildrenClass(item.subList)}`}
            style={backgroundStyle}
          >
            <span className={`mr-1 text-white`}>{item.name}</span>
          </button>
          <div className="hidden absolute peer-hover:flex hover:flex z-50 flex-col">
            {item.subList.map((sub) => {
              return (
                <div
                  key={sub.id}
                  className={`py-1 px-3 ${isDisabled(sub) ? '' : 'menuitem'} ${selectedClass(sub)}`}
                  style={backgroundStyle}
                  onClick={() => onMenuItemClick(sub)}
                >
                  <a className={`${isDisabled(sub) ? 'text-gray-300' : 'text-white'}`} href="#">
                    {sub.name}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </>
    ) : (
      <li
        key={item.id}
        className={`mr-1 ${isDisabled(item) ? '' : 'menuitem'} ${selectedClass(item)}`}
        onClick={() => onMenuItemClick(item)}
      >
        <a
          className={`block whitespace-no-wrap py-1 px-3 ${
            isDisabled(item) ? 'text-gray-300' : 'text-white'
          }`}
          href="#"
          style={backgroundStyle}
        >
          {item.name}
        </a>
      </li>
    );
  };

  return <ul className="flex text-sm dashboard">{menuItems.map(generateMenu)}</ul>;
};

export default DashboardMenu;
