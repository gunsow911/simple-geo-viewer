import React, { useContext, useEffect } from 'react';
import { context } from '@/pages';
import { disaster } from '@/components/LayerFilter/loader';
import { useRouter } from 'next/router';

const DisasterSelector = () => {
  
  const { setCurrentDisaster } = useContext(context);
  const { disasters } = useContext(context);

  const updateCurrentDisaster = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disastersPath = e.target.value;
    console.log(disastersPath)
    setCurrentDisaster(disastersPath);
  };

  const entries: disaster[] = disasters?.data;
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
