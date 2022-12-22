import React, { useContext, Dispatch, SetStateAction } from 'react';
import { context } from '@/pages';
import { Disasters, Disaster } from '@/components/LayerFilter/loader';
import { useRouter } from 'next/router';
import { Menu } from '@/components/LayerFilter/menu';
import { Config } from '@/components/LayerFilter/config';
import { Preferences, fetchJson, Settings, Backgrounds, InitialView } from '@/components/LayerFilter/loader';

type Props = {
  disasters: Disasters;
  setPreferrences: Dispatch<SetStateAction<Preferences | null>>;
  setCurrentDisaster: React.Dispatch<React.SetStateAction<string>>;
};

const DisasterSelector: React.FC<Props> = ({ disasters, setPreferrences, setCurrentDisaster}) => {
  const fetchJson = async (url: string) => await (await fetch(url)).json();
  const router = useRouter();
  
  const updateCurrentDisaster = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disastersPath = e.target.value;
    const preferencesPath = `${router.basePath}/disaster/${disastersPath}`;
    setCurrentDisaster(disastersPath);
    const results = await Promise.all([
      fetchJson(`${preferencesPath}/settings.json`),
      fetchJson(`${preferencesPath}/menu.json`),
      fetchJson(`${preferencesPath}/config.json`),
      fetchJson(`${preferencesPath}/backgrounds.json`),
      fetchJson(`${preferencesPath}/initial_view.json`),
    ]);
    
    const loadedPreferences = {
      settings: results[0] as Settings,
      menu: results[1] as Menu,
      config: results[2] as Config,
      backgrounds: results[3] as Backgrounds,
      initialView: results[4] as InitialView,
    };
    setPreferrences(loadedPreferences);
  };

  const entries: Disaster[] = disasters?.data;
  return (
    <select onChange={(e) => updateCurrentDisaster(e)}>
      {
        entries !== undefined ? (
          entries.map((disaster) => {
            if(disaster['value'] === router.query.disaster) {
              return (
                <option key={disaster.value} value={disaster.value} selected>
                  {disaster.text}
                </option>
              )
            }else{
              return (
                <option key={disaster.value} value={disaster.value}>
                  {disaster.text}
                </option>
              )
            }
        })
        ) : null
      }
    </select>
  );
};

export default DisasterSelector;
