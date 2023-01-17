import React, { createContext, useState, useEffect } from 'react';
import { NextPage } from 'next';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { clickedLayerViewState } from '@/components/Map/types';
import { defaultLegendId } from '@/components/Map/Legend/layerIds';
import { defaultInfoId } from '@/components/Map/Info/layerIds';
import { Tooltip } from '@/components/Tooltip/content';
import MouseTooltip, { MouseTooltipData } from '@/components/MouseTooltip';
import {
  usePreferences,
  Preferences,
  Settings,
  Backgrounds,
  InitialView,
} from '@/components/LayerFilter/loader';
import { getDataById, Menu } from '@/components/LayerFilter/menu';
import { Config } from '@/components/LayerFilter/config';
import Head from 'next/head';
import { closeIcon } from '@/components/SideBar/Icon';
import Draggable from 'react-draggable';
import { DashboardProvider } from '@/components/Dashboard/useDashboardContext';
import { useRecoilState, useRecoilValue } from 'recoil';
import { TooltipDataState, TooltipPositionState } from '@/store/TooltipState';
import useWeatherMap from '@/components/Map/Custom/useWeatherMap';
import { Disasters } from '@/components/LayerFilter/loader';
import { useRouter } from 'next/router';
import { LayersState } from '@/store/LayersState';

type TContext = {
  checkedLayerTitleList: string[];
  setCheckedLayerTitleList: React.Dispatch<React.SetStateAction<string[]>>;
  displayedLegendLayerId: string;
  setDisplayedLegendLayerId: React.Dispatch<React.SetStateAction<string>>;
  displayedInfoLayerId: string;
  setDisplayedInfoLayerId: React.Dispatch<React.SetStateAction<string>>;
  clickedLayerViewState: clickedLayerViewState | null;
  setClickedLayerViewState: React.Dispatch<React.SetStateAction<clickedLayerViewState | null>>;
  isDefault: boolean;
  setIsDefault: React.Dispatch<React.SetStateAction<boolean>>;
  mouseTooltipData: MouseTooltipData | null;
  setMouseTooltipData: React.Dispatch<React.SetStateAction<MouseTooltipData | null>>;
  preferences: Preferences | null;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences | null>>;
  currentDisaster: string;
  setCurrentDisaster: React.Dispatch<React.SetStateAction<string>>;
  isDisaster: boolean;
  setIsDisaster: React.Dispatch<React.SetStateAction<boolean>>;
  disasters: Disasters;
  setDisasters: React.Dispatch<React.SetStateAction<Disasters>>;
};

const useContextValues = (): TContext => {
  const [checkedLayerTitleList, setCheckedLayerTitleList] = useState<string[]>([]);
  const [displayedLegendLayerId, setDisplayedLegendLayerId] = useState<string>(defaultLegendId);
  const [displayedInfoLayerId, setDisplayedInfoLayerId] = useState<string>(defaultInfoId);
  const [clickedLayerViewState, setClickedLayerViewState] = useState<clickedLayerViewState | null>(
    null
  );
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [mouseTooltipData, setMouseTooltipData] = useState<MouseTooltipData | null>(null);

  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [currentDisaster, setCurrentDisaster] = useState<string>('');
  const [isDisaster, setIsDisaster] = useState<boolean>(false);
  const defaultDisasters: Disasters = { default: 0, data: [] };
  const [disasters, setDisasters] = useState<Disasters>(defaultDisasters);

  return {
    checkedLayerTitleList,
    setCheckedLayerTitleList,
    displayedLegendLayerId,
    setDisplayedLegendLayerId,
    displayedInfoLayerId,
    setDisplayedInfoLayerId,
    clickedLayerViewState,
    setClickedLayerViewState,
    isDefault,
    setIsDefault,
    mouseTooltipData,
    setMouseTooltipData,
    preferences,
    setPreferences,
    currentDisaster,
    setCurrentDisaster,
    isDisaster,
    setIsDisaster,
    disasters,
    setDisasters,
  };
};

export const context = createContext({} as TContext);

const App: NextPage = () => {
  const tooltipPosition = useRecoilValue(TooltipPositionState);
  const [tooltipData, setTooltipData] = useRecoilState(TooltipDataState);
  const contextValues = useContextValues();
  const { setPreferences, preferences } = useContextValues();
  // const { preferences } = usePreferences();
  const { onChangeSelect } = useWeatherMap('weather-data-mapping');

  const router = useRouter();
  const [currentDisaster, setCurrentDisaster] = useState<string>('');
  const [isDisaster, setIsDisaster] = useState<boolean>(false);
  const defaultDisasters: Disasters = { default: 0, data: [] };
  const [disasters, setDisasters] = useState<Disasters>(defaultDisasters);

  const fetchJson = async (url: string) => await (await fetch(url)).json();

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
      if (typeof preferencesPath === 'undefined') {
        preferencesPath = `${router.basePath}/defaultPreferences`;
      }
      let loadedPreferences: Preferences;
      const isdisaster = router.query.isDisaster as boolean | undefined;
      const disasterPreference = router.query.disaster as string | undefined;

      if (isdisaster) {
        if (typeof setDisasters === 'undefined') {
          return;
        }
        setIsDisaster(() => isdisaster);
        preferencesPath = `${router.basePath}/disaster`;
        const disastersData = await fetchJson(`${preferencesPath}/disasters.json`);
        setDisasters(() => disastersData);
        const disastersPath = disastersData.data[disastersData.default].value as string;
        preferencesPath = `${preferencesPath}/${disastersPath}`;
        if (typeof disasterPreference !== 'undefined') {
          preferencesPath = `${router.basePath}/disaster/${disasterPreference}`;
        }
        if (
          typeof currentDisaster !== 'undefined' &&
          typeof setCurrentDisaster !== 'undefined' &&
          currentDisaster !== ''
        ) {
          preferencesPath = preferencesPath.replace(`/${disastersPath}`, '');
          preferencesPath = `${preferencesPath}/${currentDisaster}`;
        }

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
      } else {
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
  }, [
    currentDisaster,
    router.asPath,
    router.basePath,
    router.query.disaster,
    router.query.isDisaster,
    router.query.preferences,
    router.query.querySelectLayerId,
    setPreferences,
  ]);

  const [deckGLLayers, setDeckGLLayers] = useRecoilState(LayersState);
  useEffect(() => {
    setDeckGLLayers([]);
  }, [currentDisaster]);

  if (preferences === null) {
    return <div>loading</div>;
  }

  const toolChipBaseStyle: any = {
    backgroundColor: preferences.settings.tooltip_background_color,
    position: 'absolute',
    height: '400px',
  };

  return (
    <>
      <Head>
        <title>{preferences.settings.title}</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <div className="h-screen">
        <context.Provider value={{ ...contextValues, preferences }}>
          <DashboardProvider>
            <div className="h-12">
              <Header
                disasters={disasters}
                setPreferrence={setPreferences}
                isDisaster={isDisaster}
                setCurrentDisaster={setCurrentDisaster}
              />
            </div>
            <div className="flex content" style={{ overflow: 'hidden' }}>
              <div className="w-1/5 flex flex-col h-full ml-4 mr-2 mt-4 pb-10">
                <div id="sideBar" className="overflow-auto relative flex-1">
                  <Sidebar
                    onChangeSelect={onChangeSelect}
                    currentDisaster={currentDisaster}
                    preferences={preferences}
                  />
                </div>
                {contextValues.mouseTooltipData !== null ? (
                  <div className="relative">
                    <MouseTooltip mouseTooltipData={contextValues.mouseTooltipData} />
                  </div>
                ) : undefined}
              </div>
              <div id="MapArea" className="relative w-4/5 m-2 pb-5 h-full">
                <Map />
                {tooltipData && tooltipPosition && tooltipData.data ? (
                  <Draggable bounds="parent" handle="#handle">
                    <div
                      className="w-1/4 border-2 border-black z-50"
                      style={{ ...tooltipPosition, ...toolChipBaseStyle }}
                    >
                      <Tooltip />
                      <div className="text-right absolute top-0 right-2">
                        <button
                          className="text-2xl"
                          onClick={() => setTooltipData(null)}
                          style={{ backgroundColor: toolChipBaseStyle.backgroundColor }}
                        >
                          {closeIcon()}
                        </button>
                      </div>
                    </div>
                  </Draggable>
                ) : undefined}
              </div>
            </div>
          </DashboardProvider>
        </context.Provider>
      </div>
    </>
  );
};

export default App;
