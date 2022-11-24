import React, { useContext, Dispatch, SetStateAction } from 'react';
import { context } from '@/pages';
import { Disaster } from '@/components/LayerFilter/loader';
import { useRouter } from 'next/router';
import { Disasters } from '@/components/LayerFilter/loader';
import { Preferences, fetchJsons } from '@/components/LayerFilter/loader';

type Props = {
  disasters: Disasters;
  setPreferrences: Dispatch<SetStateAction<Preferences | null>>
};

const DisasterSelector: React.FC<Props> = ({ disasters, setPreferrences}) => {
  

  const router = useRouter();
  
  const updateCurrentDisaster = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disastersPath = e.target.value;
    const preferencesPath = `${router.basePath}/disaster/${disastersPath}`;
    const loadedPreferences = await fetchJsons(preferencesPath);
    setPreferrences(loadedPreferences);
  };

  const entries: Disaster[] = disasters?.data;
  return (
    <select onChange={(e) => updateCurrentDisaster(e)}>
      {
        entries !== undefined ? (
          entries.map((disaster) => (
            <option key={disaster.value} value={disaster.value}>
              {disaster.text}
            </option>
          ))
        ) : null
      }
    </select>
  );
};

export default DisasterSelector;
