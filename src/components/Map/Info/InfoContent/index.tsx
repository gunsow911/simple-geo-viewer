import React from 'react';
import { havingInfoIdList } from '@/components/Map/Info/layerIds';

const InfoContent: React.FC<{ id: string }> = (data) => {
  return havingInfoIdList.includes(data.id) ? (
    <div className="bg-white p-4">
      <div>出典：</div>
      <p>「溶岩流ドリルマップ」（富士山火山防災対策協議会）を加工して作成</p>
      <div>
        注意
        <br />
        - 溶岩流到達可能性の範囲は、地図作成上の誤差等が含まれています。
        <br />-
        一度の噴火で、ここに示された範囲の全てに溶岩流の危険が生じるものではありません。また、実際に噴火した場合は、このマップに示された内容と異なる部分が出てくる場合があります。
      </div>
    </div>
  ) : (
    <></>
  );
};
export default InfoContent;
