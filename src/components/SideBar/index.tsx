import { context } from '@/pages';
import React, { useState, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { getVisiblyContent } from '@/components/LayerFilter/sideBar';
import { Content } from '@/components/SideBar/Content';
import { Layers } from '@/components/SideBar/Content/Layers';
import { FilterLayerInput } from '@/components/SideBar/Content/FilterLayerInput';
import { getFilteredMenu } from '@/components/LayerFilter/menu';

const Sidebar: React.FC = () => {
  const { setCheckedLayerTitleList, preferences } = useContext(context);
  const [InputFilterKeyword, setInputFilterKeyword] = useState('');
  const filteredMenu = getFilteredMenu(preferences.menu, InputFilterKeyword);
  const visiblyContentList = getVisiblyContent(filteredMenu);

  const layers = visiblyContentList.flatMap((content) => {
    return content.layers;
  });

  // 初回レンダリング時にチェック済のレイヤータイトルを設定しておく
  useEffect(() => {
    setCheckedLayerTitleList(
      layers
        .filter((value) => value.checked)
        .map((value) => {
          return value.title;
        })
    );
  }, []);

  return (
    <>
      <FilterLayerInput setFilterKeyword={setInputFilterKeyword} />
      {visiblyContentList.map((content) => (
        <Content
          title={content.title}
          layers={<Layers layers={content.layers} />}
          key={content.title}
        />
      ))}
    </>
  );
};

export default Sidebar;
