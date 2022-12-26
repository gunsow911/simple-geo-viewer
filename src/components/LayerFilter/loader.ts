import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import { Menu } from './menu';
import { Config } from './config';
import { RasterSource } from 'maplibre-gl';
import { route } from 'next/dist/server/router';
import { context } from '@/pages';
import { getDataById } from '@/components/LayerFilter/menu';
import { Element } from 'chart.js';


/**
 * settings.json
 */
export type Settings = {
  title: string;
  background_color: string;
  tooltip_background_color: string;
  dashboard_enable?: boolean;
};
/**
 * backgrounds.json
 */
export type Backgrounds = {
  [key: string]: {
    name: string;
    source: RasterSource;
  };
};
/**
 * initial_view.json
 */
export type InitialView = {
  map: {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
  };
};

export type Disaster = {
  text: string;
  value: string; 
} 

/**
 * disasters.json
 */
export type Disasters = {
    default: number;
    data: Disaster[];
}

/**
 * 複数の設定ファイルJSONを読み込んだ結果を格納するデータ型
 */
export type Preferences = {
  settings: Settings;
  menu: Menu;
  config: Config;
  backgrounds: Backgrounds;
  initialView: InitialView;
};

export const fetchJson = async (url: string) => await (await fetch(url)).json();

/**
 * リモートにある設定ファイルJSON群を取得しstateを返す
 * @param router
 * @returns
 */
export const usePreferences = () => {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const { setIsDisaster, setDisasters, currentDisaster, setCurrentDisaster } = useContext(context);
  useEffect(() => {
    // preferencesが指定されているがqueryとして読み込みが完了していない場合はJSONの取得処理の開始を保留する
    if (router.asPath.includes('preferences=') && typeof router.query.preferences === 'undefined')
      return;
    if (
      router.asPath.includes('querySelectLayerId=') &&
      typeof router.query.querySelectLayerId === 'undefined'
    )
      return;

    (async () => {
      // クエリパラメータでpreferencesが指定されていればそのURLを
      // 指定されていなければデフォルト設定を読み込む
      let preferencesPath = router.query.preferences as string | undefined;
      if (preferencesPath === '') {
        alert('preferences=に設定ファイルのあるフォルダを指定してください。');
        return;
      }
      if (typeof preferencesPath === 'undefined') {
        preferencesPath = `${router.basePath}/defaultPreferences`;
      }
      let loadedPreferences: Preferences;
      const isdisaster = router.query.isDisaster as boolean | undefined;
      const disasterPreference = router.query.disaster as string | undefined;

      if (isdisaster) {
        if (typeof setDisasters === 'undefined'){
          return;
        }
        setIsDisaster(() => isdisaster);
        preferencesPath = `${router.basePath}/disaster`;
        const disastersData = await fetchJson(`${preferencesPath}/disasters.json`);
        setDisasters(() => disastersData);
        const disastersPath = disastersData.data[disastersData.default].value as string;
        preferencesPath = `${preferencesPath}/${disastersPath}`;
        if (typeof disasterPreference !== undefined) {
          preferencesPath = `${router.basePath}/disaster/${disasterPreference}`;
        }
        if (typeof currentDisaster !== 'undefined' && typeof setCurrentDisaster !== 'undefined' && currentDisaster !== '') {
            preferencesPath = preferencesPath.replace(`/${disastersPath}`,'');
            preferencesPath = `${preferencesPath}/${currentDisaster}`;
        };
        
        
        const results = await Promise.all([
          fetchJson(`${preferencesPath}/settings.json`),
          fetchJson(`${preferencesPath}/menu.json`),
          fetchJson(`${preferencesPath}/config.json`),
          fetchJson(`${preferencesPath}/backgrounds.json`),
          fetchJson(`${preferencesPath}/initial_view.json`),
        ]);
        
        loadedPreferences = {
          settings: results[0] as Settings,
          menu: results[1] as Menu,
          config: results[2] as Config,
          backgrounds: results[3] as Backgrounds,
          initialView: results[4] as InitialView,
        };

        setCurrentDisaster(() => disastersPath);
      }else{
        const results = await Promise.all([
          fetchJson(`${preferencesPath}/settings.json`),
          fetchJson(`${preferencesPath}/menu.json`),
          fetchJson(`${preferencesPath}/config.json`),
          fetchJson(`${preferencesPath}/backgrounds.json`),
          fetchJson(`${preferencesPath}/initial_view.json`),
        ]);

        loadedPreferences = {
          settings: results[0] as Settings,
          menu: results[1] as Menu,
          config: results[2] as Config,
          backgrounds: results[3] as Backgrounds,
          initialView: results[4] as InitialView,
        };

        let querySelectLayerId = router.query.querySelectLayerId as string | undefined;
        querySelectLayerId = querySelectLayerId === undefined ? '' : querySelectLayerId;
        if (querySelectLayerId !== '') {
          let targetResource = getDataById(loadedPreferences.menu, [querySelectLayerId]);
          targetResource.checked = true;
          for (
            let categoryIndex = 0;
            categoryIndex < loadedPreferences.menu.length;
            categoryIndex++
          ) {
            const element = loadedPreferences.menu[categoryIndex];
            for (let dataIndex = 0; dataIndex < element.data.length; dataIndex++) {
              const resource = element.data[dataIndex];
              if (resource.id[0] === targetResource.id[0]) {
                loadedPreferences.menu[categoryIndex].data[dataIndex] = targetResource;
              }
            }
          }
        }
      }
      setPreferences(() => loadedPreferences);
    })();
  }, [router.query.preferences, router.query.querySelectLayerId, setIsDisaster, setDisasters, currentDisaster, setCurrentDisaster]);
  return { preferences };
};