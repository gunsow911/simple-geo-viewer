import { Map, Marker } from 'maplibre-gl';
import { Dispatch, SetStateAction } from 'react';
import { getPropertiesObj } from '@/components/Tooltip/util';
import { Tooltip } from './content';
import { PickInfo } from 'deck.gl';

let pointMarker: Marker | null = null;

export const removeExistingTooltip = (setTooltip) => {
  if (pointMarker) pointMarker.remove();
  setTooltip({
    tooltip: null,
  });
};

const makeMarker = (lng: number, lat: number, map: Map) => {
  //marker追加
  pointMarker = new Marker().setLngLat([lng, lat]).addTo(map);
};

export const show = (
  object: any,
  lng: number,
  lat: number,
  map: any,
  setTooltipData: Dispatch<SetStateAction<any>>,
  tooltipType: string,
  id: string
) => {
  //すでに表示されているマーカーとポップアップを削除
  removeExistingTooltip(setTooltipData);
  //データが渡されていなければ何もしない
  if (!object) return;
  makeMarker(lng, lat, map);
  setTooltipData((prevState) => {
    return {
      ...prevState,
      tooltip: getPropertiesObj(object, !tooltipType ? 'default' : tooltipType, id),
    };
  });
};

export const showToolTip = (
  info: PickInfo<any>,
  map: Map,
  setTooltipData: Dispatch<SetStateAction<any>>,
  setsetTooltipPosition: Dispatch<SetStateAction<any>>
) => {
  // @ts-ignore
  const { coordinate, object } = info;
  if (!coordinate) return;
  if (!object) return;
  // @ts-ignore
  const {
    layer: {
      props: { tooltipType },
    },
  } = info;
  const {
    layer: { id },
  } = info;

  const parent = document.getElementById('MapArea');
  const body = document.getElementsByTagName('body')[0];
  const tooltipWidth = body.clientWidth * 0.25;
  const tooltipHeight = body.clientHeight * 0.25;
  const parentWidth = parent !== null ? parent.clientWidth : 10;
  const parentHeight = parent !== null ? parent.clientHeight : 10;

  let x = info.x;
  let y = info.y;

  if (x + tooltipWidth + 40 > parentWidth) {
    x = parentWidth - tooltipWidth - 40;
  }

  if (y + tooltipHeight + 300 > parentHeight) {
    y = parentHeight - tooltipHeight - 300;
  }
  setsetTooltipPosition({
    top: `${String(y)}px`,
    left: `${String(x)}px`,
  });
  show(object, coordinate[0], coordinate[1], map, setTooltipData, tooltipType, id);
};
