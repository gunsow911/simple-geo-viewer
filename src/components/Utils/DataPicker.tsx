import ja from 'date-fns/locale/ja';
import dayjs from 'dayjs';
import React from 'react';
// react-draggableとDraggableの名前空間が被るためタイプヒントは使わない
import ReactDatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';

registerLocale('ja', ja);

export const DatePicker = (props: ReactDatePickerProps) => {
  return (
    <div>
      <ReactDatePicker
        locale={ja}
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div>
            <div>
              <button className="px-2" onClick={decreaseMonth}>
                &lt;
              </button>
              <span>
                {dayjs(date).year()}年 {dayjs(date).month() + 1}月
              </span>
              <button className="px-2" onClick={increaseMonth}>
                &gt;
              </button>
            </div>
          </div>
        )}
        {...props}
      />
    </div>
  );
};
