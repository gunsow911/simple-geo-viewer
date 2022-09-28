import { Map, RasterSource } from 'maplibre-gl';

import React, { useContext, useState } from 'react';
import { context } from '@/pages';
import { disaster, fetchJsons, fetchJson, Preferences, disasters, usePreferences  } from '@/components/LayerFilter/loader';
import { useRouter } from 'next/router';

type Props = {
  map: Map;
};

const DisasterSelector: React.FunctionComponent<Props> = () => {
  const router = useRouter();
  const { preferences } = usePreferences();
  const { currentDisaster, setCurrentDisaster } = useContext(context);
  if (preferences === null) {
    return null;
  };
  
  // (async () => {
  //   let loadedPreferences: Preferences;
  //   let preferencesPath = router.query.preferences as string | undefined;
  //   preferencesPath = `${router.basePath}/disaster`;
  //   preferencesPath = `${preferencesPath}/${currentDisaster}`;
  //   loadedPreferences = await fetchJsons(preferencesPath);
  //   setPreferences(loadedPreferences);
  // })();
  

  const updateCurrentDisaster = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disastersPath = e.target.value;
    setCurrentDisaster(disastersPath);
  };

  const entries: disaster[] = preferences.disasters?.data;
  return (
    <select value={currentDisaster} onChange={(e) => updateCurrentDisaster(e)}>
      {entries.map((disaster) => (
        <option key={disaster.value} value={disaster.value}>
          {disaster.text}
        </option>
      ))}
    </select>
  );
};

export default DisasterSelector;
