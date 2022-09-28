import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Menu } from './menu';
import { Config } from './config';
import { RasterSource } from 'maplibre-gl';
import { route } from 'next/dist/server/router';
import { context } from '@/pages';

/**
 * settings.json
 */
export type Settings = {
  title: string;
  background_color: string;
  tooltip_background_color: string;
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


export type disaster = {
  text: string;
  value: string; 
} 

/**
 * disasters.json
 */
export type disasters = {
    default: number;
    data: disaster[];
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
  disasters?: disasters;
};

export const fetchJson = async (url: string) => await (await fetch(url)).json();

export const fetchJsons = async(preferencesPath: string) => {
  const results = await Promise.all([
    fetchJson(`${preferencesPath}/settings.json`),
    fetchJson(`${preferencesPath}/menu.json`),
    fetchJson(`${preferencesPath}/config.json`),
    fetchJson(`${preferencesPath}/backgrounds.json`),
    fetchJson(`${preferencesPath}/initial_view.json`),
  ]);

  const loadedPreferences: Preferences = {
    settings: results[0] as Settings,
    menu: results[1] as Menu,
    config: results[2] as Config,
    backgrounds: results[3] as Backgrounds,
    initialView: results[4] as InitialView,
  };
  return loadedPreferences
}

export const getPreferrence = async (dir: string) => {
  
}

/**
 * リモートにある設定ファイルJSON群を取得しstateを返す
 * @param router
 * @returns
 */
export const usePreferences = () => {
  const router = useRouter();
  const [ preferences, setPreferences ] = useState<Preferences | null>(null);
  const { currentDisaster, setCurrentDisaster } = useContext(context);
  useEffect(() => {
    // preferencesが指定されているがqueryとして読み込みが完了していない場合はJSONの取得処理の開始を保留する
    if (router.asPath.includes('preferences=') && typeof router.query.preferences === 'undefined')
      return;

    (async () => {
      // クエリパラメータでpreferencesが指定されていればそのURLを
      // 指定されていなければデフォルト設定を読み込む
      let preferencesPath = router.query.preferences as string | undefined;
      if (typeof preferencesPath === 'undefined') {
        preferencesPath = `${router.basePath}/defaultPreferences`;
      }
      let loadedPreferences: Preferences;
      const isDisaster = router.query.isDisaster as boolean | undefined;
      if (isDisaster) {
        preferencesPath = `${router.basePath}/disaster`;
        const disasters = await fetchJson(`${preferencesPath}/disasters.json`);
        const disastersPath = disasters.data[disasters.default].value as string;
        preferencesPath = `${preferencesPath}/${disastersPath}`;
        if (typeof currentDisaster !== 'undefined' && typeof setCurrentDisaster !== 'undefined' && currentDisaster !== '') {
          preferencesPath = preferencesPath.replace(`/${disastersPath}`,'');
          preferencesPath = `${preferencesPath}/${currentDisaster}`;
        };
        loadedPreferences = await fetchJsons(preferencesPath);
        loadedPreferences.disasters = disasters as disasters;
      }else{
        loadedPreferences = await fetchJsons(preferencesPath);
      }
      
      setPreferences(() => loadedPreferences);
    })();
  }, [router.query.preferences, setCurrentDisaster, currentDisaster]);
  return { preferences };
};
