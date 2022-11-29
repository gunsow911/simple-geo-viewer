import { getPropertiesObj } from '@/components/Tooltip/util';
import { SetterOrUpdater } from 'recoil';
import { PickInfo } from 'deck.gl';

export const showToolTip = (
  info: PickInfo<any>,
  setTooltipData: SetterOrUpdater<{
    lng: number;
    lat: number;
    tooltipType: 'default' | 'thumbnail' | 'table';
    id: string;
    data: any;
  } | null>,
  setTooltipPosition: SetterOrUpdater<{ top: string; left: string } | null>
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
  setTooltipPosition({
    top: `${String(y)}px`,
    left: `${String(x)}px`,
  });
  const data = getPropertiesObj(object, tooltipType, id);
  setTooltipData({
    lng: coordinate[0],
    lat: coordinate[1],
    tooltipType,
    id,
    data,
  });
};
