import React from 'react';
import dayjs from 'dayjs';
import { BaseInformationProperty } from '@/store/PanelState';
import { Feature, Point } from 'geojson';

type Props = {
  feature: Feature<Point, BaseInformationProperty>;
};

/**
 * 基本情報コンポーネント
 */
const BasicInformation = ({ feature }: Props) => {
  return (
    <>
      <div>
        <span className="mr-2 font-semibold">地点</span>
        <span>{feature.properties.locationName}</span>
      </div>
      <div>
        <span className="mr-2 font-semibold">期間</span>
        <span>
          {dayjs(feature.properties.startDate).format('YYYY/MM/DD')}〜
          {dayjs(feature.properties.endDate).format('YYYY/MM/DD')}
        </span>
      </div>
      <div>
        <span className="mr-2 font-semibold">緯度</span>
        <span className="mr-2">{feature.geometry.coordinates[1]}</span>
        <span className="mr-2 font-semibold">経度</span>
        <span className="mr-2">{feature.geometry.coordinates[0]}</span>
        <span className="mr-2 font-semibold">標高</span>
        <span className="mr-2">{feature.properties.altitude}m</span>
      </div>
      <div>
        <div>{feature.properties.description}</div>
        <div className="flex justify-end">
          <a
            className="m-0 px-1 border"
            href={feature.properties.downloadUrl}
            onClick={(e) => {
              e.stopPropagation();
            }}
            rel="noreferrer noopener"
          >
            <span className="mr-1 my-auto">ダウンロード</span>
            <svg
              className="inline-block"
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="download"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
              />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default BasicInformation;
