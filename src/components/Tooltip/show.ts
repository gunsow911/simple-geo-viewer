import { Map, Marker } from 'maplibre-gl';
import { Dispatch, SetStateAction } from 'react';
import { getPropertiesObj } from '@/components/Tooltip/util';
import { Tooltip } from './content';

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
      tooltip: getPropertiesObj(object, !tooltipType ? "default" : tooltipType, id),
    };
  });
};

export const dragStartToolchip = function(event: DragEvent){

}

export const onDragOverToolchip = function(event: DragEvent){
  event.preventDefault();
}

export const onDropToolchip = function(event: DragEvent){
  event.preventDefault();
  let toolchip = document.getElementById("toolchip");
  const parent = document.getElementById("MapArea");
  const body = document.getElementsByTagName("body")[0];
  const tooltipWidth = body.clientWidth * 0.25;
  const tooltipHeight = body.clientHeight * 0.25;
  const parentWidth = parent !== null ? (parent.clientWidth) : 10 ;
  const parentHeight = parent !== null ? (parent.clientHeight) : 10 ;

  let x = event.pageX - toolchip.offsetLeft;
  let y = event.pageY - toolchip?.offsetTop;

  // if (x + tooltipWidth +40 > parentWidth) {
  //   x = parentWidth -tooltipWidth -40;
  // }

  // if (y + tooltipHeight +300 > parentHeight) {
  //   y = parentHeight - tooltipHeight -300;
  // }
  toolchip.style.top = `${String(y)}px`;
  toolchip.style.left = `${String(x)}px`;
}