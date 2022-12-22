import { context } from '@/pages';
import React, { useState, useContext, Dispatch, SetStateAction, useEffect } from 'react';
import { getVisiblyContent } from '@/components/LayerFilter/sideBar';
import { Content } from '@/components/SideBar/Content';
import { Layers } from '@/components/SideBar/Content/Layers';
import { FilterLayerInput } from '@/components/SideBar/Content/FilterLayerInput';
import { getFilteredMenu } from '@/components/LayerFilter/menu';
import { Preferences } from '@/components/LayerFilter/loader';

type Props = {
  onChangeSelect?: (layerId: string, selected: boolean) => void;
  currentDisaster: string;
  preferences: Preferences;
};

const Sidebar = (props: Props) => {
  const { setCheckedLayerTitleList } = useContext(context);
  const [InputFilterKeyword, setInputFilterKeyword] = useState('');
  const filteredMenu = getFilteredMenu(props.preferences.menu, InputFilterKeyword);
  const visiblyContentList = getVisiblyContent(filteredMenu);
  
  // 初回レンダリング時にチェック済のレイヤータイトルを設定しておく
  useEffect(() => {
    setCheckedLayerTitleList(
      visiblyContentList
        .flatMap((content) => {
          return content.layers;
        })
        .filter((value) => value.checked)
        .map((value) => {
          return value.title;
        })
    );
  }, []);

  useEffect(() => {
    setCheckedLayerTitleList(
      visiblyContentList
        .flatMap((content) => {
          return content.layers;
        })
        .filter((value) => value.checked)
        .map((value) => {
          return value.title;
        })
    );
  }, [props.preferences]);

  return (
    <>
      <FilterLayerInput setFilterKeyword={setInputFilterKeyword} />
      {visiblyContentList.map((content) => (
        <Content
          title={content.title}
          layers={<Layers layers={content.layers} onChange={props.onChangeSelect} currentDisaster={props.currentDisaster}/>}
          key={content.title}
        />
      ))}
    </>
  );
};

export default Sidebar;
