import React, { ReactNode } from 'react';
import CloseButton from '@/components/Utils/CloseButton';
import Draggable from 'react-draggable';

type Props = {
  title?: string;
  titleBarColor?: string;
  darkmode?: boolean;
  width?: number;
  onClose?: () => void;
  children?: ReactNode;
};

/**
 * ドラッグで移動可能なウインドウパネル
 */
const MovableWindowPanel = (props: Props) => {
  return (
    <>
      <Draggable cancel=".body">
        <div style={{ width: props.width ?? 384 }} className="z-10 absolute top-2 left-2">
          <div
            style={{ backgroundColor: props.titleBarColor ?? '#17a2b8' }}
            className="title p-1 cursor-move"
          >
            <div className="absolute top-1 right-1">
              <CloseButton onClick={props.onClose} darkmode={props.darkmode} />
            </div>
            <div className={`${props.darkmode ? 'text-white' : 'text-black'} ml-1`}>
              {props.title}
            </div>
          </div>
          <div className="body px-2 pb-2 pt-1 bg-white opacity-90">{props.children}</div>
        </div>
      </Draggable>
    </>
  );
};

export default MovableWindowPanel;
