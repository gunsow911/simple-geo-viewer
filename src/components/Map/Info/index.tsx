import React, { useContext } from 'react';
import { context } from '@/pages';
import InfoContent from '@/components/Map/Info/InfoContent';
import { clickedLayerViewState } from '@/components/Map/types';
import { havingInfoIdList } from '@/components/Map/Info/layerIds';
import { getDataTitleById } from '@/components/LayerFilter/menu';
import { getCheckedLayerIdByDataTitleList } from '@/components/LayerFilter/sideBar';
import { defaultInfoId } from '@/components/Map/Info/layerIds';
import { getLayerConfigById } from '@/components/LayerFilter/config';

const getInfoClickedLayerId = (clickedLayerViewState: clickedLayerViewState | null) => {
  return clickedLayerViewState ? clickedLayerViewState.id : '';
};

/**
 * 注意書きを表示するレイヤのidを取得
 * - 注意書きを持つレイヤをチェックしたらその注意書きを表示
 * - チェックを外したら、他にチェックされているレイヤを最後にチェックされた順に走査して注意書きを持つものがあれば表示
 */
export const useGetInfoClickedLayerId = () => {
  const {
    clickedLayerViewState,
    checkedLayerTitleList,
    displayedInfoLayerId,
    setDisplayedInfoLayerId,
    isDefault,
    setIsDefault,
    preferences,
  } = useContext(context);

  const clickedId = getInfoClickedLayerId(clickedLayerViewState);

  // 現在凡例が表示されている場合、そのタイトルを取得
  let displayedInfoLayerTitle = '';

  if (displayedInfoLayerId !== '' && (preferences)) {
    if (getLayerConfigById(displayedInfoLayerId, preferences.config) !== undefined) {
      displayedInfoLayerTitle = getDataTitleById(preferences.menu, displayedInfoLayerId);
    }
  }
  // 初回にこの関数が呼ばれた際は何も返さない
  if (isDefault) {
    setIsDefault(false);
    return '';
  }

  // 情報を持つレイヤがチェックされた時
  if (clickedId && havingInfoIdList.includes(clickedId)) {
    setDisplayedInfoLayerId(clickedId);
    return clickedId;

    // 情報を持たないレイヤがチェックされた時
  } else if (clickedId && !havingInfoIdList.includes(clickedId)) {
    // すでに表示されている情報があればそのまま表示
    if (displayedInfoLayerTitle) {
      return displayedInfoLayerId;
    }
    // 現在情報が表示されておらず、かつ情報を持つレイヤがチェックされていたら、その情報を表示
    if (preferences) {
      const id = getCheckedLayerIdByDataTitleList(checkedLayerTitleList, preferences.menu);
      setDisplayedInfoLayerId(id);
      return id;
    }

    // すでに表示されている情報のレイヤ以外のチェックが外された場合、そのまま表示
  } else if (!clickedId && checkedLayerTitleList.includes(displayedInfoLayerTitle)) {
    return displayedInfoLayerId;

    // デフォルト時の処理
  } else if (
    !clickedId &&
    checkedLayerTitleList.includes(displayedInfoLayerTitle) &&
    displayedInfoLayerId === defaultInfoId
  ) {
    return defaultInfoId;

    // すでに表示されている情報のレイヤのチェックが外された場合
  } else if (!clickedId && !checkedLayerTitleList.includes(displayedInfoLayerTitle)) {
    // 情報を持つレイヤがチェックされていたら、その情報を表示
    if (preferences) {
      const id = getCheckedLayerIdByDataTitleList(checkedLayerTitleList, preferences.menu);
      setDisplayedInfoLayerId(id);
      return id;
    }
  }
  // getCheckedLayerIdByDataTitleListですべて拾えている想定だが一応追加
  setDisplayedInfoLayerId('');
  return '';
};

const Info: React.FC<{ id: string }> = ({ id }) => {
  return id ? <>{id ? <InfoContent id={id} /> : ''}</> : <></>;
};
export default Info;
