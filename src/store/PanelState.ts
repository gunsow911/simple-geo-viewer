import { atom } from 'recoil';
import { Feature, Point } from 'geojson';

/**
 * 気象データマッピングの列データ
 */
export type WeatherMapRow = {
  date: string;
  temperature: number;
  relativeHumidity: number;
  luminosity: number;
  rainfall: number;
  windVelocity: number;
  windDiraction: string;
  atmosphericPressure: number;
};

export type BaseInformationProperty = {
  locationName: string;
  startDate: string;
  endDate: string;
  altitude: number;
  description: string;
  downloadUrl: string;
};

type WeatherMapPanelStateAtom = {
  show: boolean;
  feature?: Feature<Point, BaseInformationProperty>;
  data?: WeatherMapRow[];
};

export const WeatherMapPanelState = atom<WeatherMapPanelStateAtom>({
  key: 'weatherMapPanel',
  dangerouslyAllowMutability: true,
  default: {
    show: false,
    feature: undefined,
    data: undefined,
  },
});
