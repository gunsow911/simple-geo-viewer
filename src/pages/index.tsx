import React, { createContext, useState } from 'react';
import { NextPage } from 'next';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { clickedLayerViewState } from '@/components/Map/types';
import { defaultLegendId } from '@/components/Map/Legend/layerIds';
import { Tooltip } from '@/components/Tooltip/content';
import MouseTooltip, { MouseTooltipData } from '@/components/MouseTooltip';
import { usePreferences, Preferences } from '@/components/LayerFilter/loader';
import Head from 'next/head';
import { closeIcon } from '@/components/SideBar/Icon';
import Draggable from 'react-draggable';
import { DashboardProvider } from '@/components/Dashboard/useDashboardContext';
import { useRecoilState, useRecoilValue } from 'recoil';
import { TooltipDataState, TooltipPositionState } from '@/store/TooltipState';
import useWeatherMap from '@/components/Map/Custom/useWeatherMap';
import { Disasters } from '@/components/LayerFilter/loader';


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
  preferences: Preferences | null;
  setPreferences : React.Dispatch<React.SetStateAction<Preferences | null>>;
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
  const [clickedLayerViewState, setClickedLayerViewState] = useState<clickedLayerViewState | null>(
    null
  );
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [mouseTooltipData, setMouseTooltipData] = useState<MouseTooltipData | null>(null);

  const [ preferences, setPreferences ] = useState<Preferences | null>(null);
  const [currentDisaster, setCurrentDisaster] = useState<string>('');
  const [isDisaster, setIsDisaster] = useState<boolean>(false);
  const defaultDisasters: Disasters =  {default:0,data:[]} 
  const [disasters, setDisasters] = useState<Disasters>(defaultDisasters)

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
    preferences,
    setPreferences,
    currentDisaster,
    setCurrentDisaster,
    isDisaster,
    setIsDisaster,
    disasters,
    setDisasters
  };
};

export const context = createContext({} as TContext);

const App: NextPage = () => {
  const tooltipPosition = useRecoilValue(TooltipPositionState);
  const [tooltipData, setTooltipData] = useRecoilState(TooltipDataState);
  const contextValues = useContextValues();
  const { setPreferences } = useContextValues();
  const { preferences } = usePreferences();
  const { onChangeSelect } = useWeatherMap('weather-data-mapping');
  const { disasters } = useContextValues();
  const { isDisaster } = useContextValues();

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
            <Header disasters={disasters} setPreferrence={setPreferences} isDisaster={isDisaster}/>
            </div>
            <div className="flex content" style={{ overflow: 'hidden' }}>
              <div className="w-1/5 flex flex-col h-full ml-4 mr-2 mt-4 pb-10">
                <div id="sideBar" className="overflow-auto relative flex-1">
                  <Sidebar onChangeSelect={onChangeSelect} />
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
