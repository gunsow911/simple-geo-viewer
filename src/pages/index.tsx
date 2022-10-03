import React, { createContext, useEffect, useState, useContext } from 'react';
import { NextPage } from 'next';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { clickedLayerViewState } from '@/components/Map/types';
import { defaultLegendId } from '@/components/Map/Legend/layerIds';
import { Tooltip } from '@/components/Tooltip/content';
import { removeExistingTooltip } from '@/components/Tooltip/show';
import MouseTooltip, { MouseTooltipData } from '@/components/MouseTooltip';
import { useRouter } from 'next/router';
import { usePreferences, Preferences, fetchJson, fetchJsons } from '@/components/LayerFilter/loader';
import Head from 'next/head';
import { closeIcon } from '@/components/SideBar/Icon';
import { Backgrounds, Disasters } from '../components/LayerFilter/loader';

type TContext = {
  checkedLayerTitleList: string[];
  setCheckedLayerTitleList: React.Dispatch<React.SetStateAction<string[]>>;
  displayedLegendLayerId: string;
  setDisplayedLegendLayerId: React.Dispatch<React.SetStateAction<string>>;
  clickedLayerViewState: clickedLayerViewState | null;
  setClickedLayerViewState: React.Dispatch<React.SetStateAction<clickedLayerViewState | null>>;
  isDefault: boolean;
  setIsDefault: React.Dispatch<React.SetStateAction<boolean>>;
  mouseTooltipData: MouseTooltipData | null;
  setMouseTooltipData: React.Dispatch<React.SetStateAction<MouseTooltipData | null>>;
  preferences: Preferences;
  setCurrentDisaster: React.Dispatch<React.SetStateAction<string>>;
  isDisaster: boolean;
  setIsDisaster: React.Dispatch<React.SetStateAction<boolean>>;
  disasters: Disasters |  null;
  setDisasters: React.Dispatch<React.SetStateAction<Disasters>>;
};

const useContextValues = (): Omit<TContext, 'preferences'> => {
  const [checkedLayerTitleList, setCheckedLayerTitleList] = useState<string[]>([]);
  const [displayedLegendLayerId, setDisplayedLegendLayerId] = useState<string>(defaultLegendId);
  const [clickedLayerViewState, setClickedLayerViewState] = useState<clickedLayerViewState | null>(
    null
  );
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [mouseTooltipData, setMouseTooltipData] = useState<MouseTooltipData | null>(null);
  const [currentDisaster, setCurrentDisaster] = useState<string>('');
  const [isDisaster, setIsDisaster] = useState<boolean | undefined>(false);
  const [disasters, setDisasters] = useState<Disasters | null>(null);
  return {
    checkedLayerTitleList,
    setCheckedLayerTitleList,
    displayedLegendLayerId,
    setDisplayedLegendLayerId,
    clickedLayerViewState,
    setClickedLayerViewState,
    isDefault,
    setIsDefault,
    mouseTooltipData,
    setMouseTooltipData,
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
  const [tooltipData, setTooltipData] = useState<any>({
    tooltip: null,
  });

  const [setTooltipPosition, setsetTooltipPosition] = useState<any>({});

  const contextValues = useContextValues();
  const router = useRouter();
  const { preferences, setPreferences } = usePreferences();
  const { currentDisaster, setCurrentDisaster } = useContextValues();
  const { setDisasters } = useContextValues();
  const { isDisaster, setIsDisaster } = useContextValues();

  useEffect(() => {
    
    if (router.asPath.includes('preferences=') && typeof router.query.preferences === 'undefined')
      return;
    (async () => {
      // クエリパラメータでpreferencesが指定されていればそのURLを
      // 指定されていなければデフォルト設定を読み込む
      let preferencesPath = router.query.preferences as string | undefined;
      if (typeof preferencesPath === 'undefined') {
        preferencesPath = `${router.basePath}/defaultPreferences`;
      };
      let loadedPreferences: Preferences;
      const isdisaster = router.query.isDisaster as boolean | undefined;
      
      
      if (isdisaster) {
        if (typeof setDisasters === 'undefined'){
          return;
        }
        setIsDisaster(isdisaster);
        preferencesPath = `${router.basePath}/disaster`;
        const disastersData = await fetchJson(`${preferencesPath}/disasters.json`);
        setDisasters(disastersData);
        const disastersPath = disastersData.data[disastersData.default].value as string;
        preferencesPath = `${preferencesPath}/${disastersPath}`;
        if (typeof currentDisaster !== 'undefined' && typeof setCurrentDisaster !== 'undefined' && currentDisaster !== '') {
          preferencesPath = preferencesPath.replace(`/${disastersPath}`,'');
          preferencesPath = `${preferencesPath}/${currentDisaster}`;
        };
        loadedPreferences = await fetchJsons(preferencesPath);
      }else{
        loadedPreferences = await fetchJsons(preferencesPath);
      }
      setPreferences(() => loadedPreferences);
    })();
  },[router.asPath, router.query.preferences, currentDisaster]);
  
  if (preferences === null) {
    return (
      <>
        <div>loading</div>
      </>
    );
  }
  
  // const isdisaster = router.query.isDisaster as boolean | undefined;
  // setIsDisaster(isDisaster);

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
          <div className="h-12">
            <Header />
          </div>
          <div className="flex content" style={{ overflow: 'hidden' }}>
            <div className="w-1/5 flex flex-col h-full ml-4 mr-2 mt-4 pb-10">
              <div id="sideBar" className="overflow-auto relative flex-1">
                <Sidebar />
              </div>
              {contextValues.mouseTooltipData !== null ? (
                <div className="relative">
                  <MouseTooltip mouseTooltipData={contextValues.mouseTooltipData} />
                </div>
              ) : undefined}
            </div>
            <div id="MapArea" className="relative w-4/5 m-2 pb-5 h-full">
              <Map setTooltipData={setTooltipData} setsetTooltipPosition={setsetTooltipPosition} />
              {tooltipData.tooltip ? (
                <div
                  className="w-1/4 border-2 border-black z-50"
                  style={{ ...setTooltipPosition, ...toolChipBaseStyle }}
                >
                  {tooltipData.tooltip ? <Tooltip {...tooltipData.tooltip} /> : undefined}
                  <div className="text-right absolute top-0 right-2">
                    <button
                      className="text-2xl"
                      onClick={() => removeExistingTooltip(setTooltipData)}
                      style={{ backgroundColor: toolChipBaseStyle.backgroundColor }}
                    >
                      {closeIcon()}
                    </button>
                  </div>
                </div>
              ) : undefined}
            </div>
          </div>
        </context.Provider>
      </div>
    </>
  );
};

export default App;
