import { Map, RasterSource } from 'maplibre-gl';

import React, { useContext } from 'react';
import { context } from '@/pages';
import { disaster, fetchJsons, fetchJson, Preferences, disasters, usePreferences  } from '@/components/LayerFilter/loader';
import { useRouter } from 'next/router';

type Props = {
  map: Map;
};

const DisasterSelector: React.FunctionComponent<Props> = () => {
  const { preferences, setPreferences } = usePreferences();
  const router = useRouter();
  if (preferences === null) {
    return null;
  };

  const updateCurrentDisaster = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disastersPath = e.target.value;
    let loadedPreferences: Preferences;
    let preferencesPath = router.query.preferences as string | undefined;
    preferencesPath = `${router.basePath}/disaster`;
    const disasters = await fetchJson(`${preferencesPath}/disasters.json`);
    preferencesPath = `${preferencesPath}/${disastersPath}`;
    loadedPreferences = await fetchJsons(preferencesPath);
    loadedPreferences.disasters = disasters as disasters;
    setPreferences(loadedPreferences);
  };

  const entries: disaster[] = preferences.disasters?.data;
  return (
    <select onChange={(e) => updateCurrentDisaster(e)}>
      {entries.map((disaster) => (
        <option key={disaster.value} value={disaster.value}>
          {disaster.text}
        </option>
      ))}
    </select>
  );
};

export default DisasterSelector;
