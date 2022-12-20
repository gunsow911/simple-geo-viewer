import React, { useContext, Dispatch, SetStateAction } from 'react';
import { context } from '@/pages';
import { useRouter } from 'next/router';
import DashboardMenu from '@/components/Dashboard/Menu/DashboardMenu';
import { Disasters } from '@/components/LayerFilter/loader';
import DisasterSelector  from "@/components/Header/DisasterSelector";
import { Preferences } from '@/components/LayerFilter/loader';

type Props = {
  disasters: Disasters;
  isDisaster: boolean;
  setPreferrence: Dispatch<SetStateAction<Preferences | null>>;
};

const Header: React.FC<Props> = ({ disasters, setPreferrence, isDisaster }) => {
  const { preferences } = useContext(context);
  const router = useRouter();
  if (preferences === null) return null;
  const headerStyle = {
    backgroundColor: preferences.settings.background_color,
  };

  const dashboardEnable = () => {
    return preferences.settings.dashboard_enable === true;
  };

  return (
    <header style={headerStyle} className="h-full flex justify-left items-center">
      {dashboardEnable() ? (
        <>
          <div className="text-left text-white text-xl w-3/12 p-3">
            {preferences.settings.title}
          </div>
          <div className="py-2 flex justify-center w-6/12">
            <DashboardMenu />
          </div>
          <div className="text-right text-white font-semibold text-3l w-3/12 p-3">
            Powerd By AIGID
          </div>
          { isDisaster ? (
            <div className="text-left z-10 absolute top-2 right-40 bg-white p-1">
              <DisasterSelector disasters={disasters} setPreferrences={setPreferrence}/>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="text-left text-white text-xl w-7/12 p-3">
            {preferences.settings.title}
          </div>
          <div className="text-right text-white font-semibold text-3l w-7/12 p-3">
            Powerd By AIGID
          </div>
          { isDisaster ? (
            <div className="text-left z-10 absolute top-2 right-40 bg-white p-1">
              <DisasterSelector disasters={disasters} setPreferrences={setPreferrence}/>
            </div>
          ) : null}
        </>
      )}
    </header>
  );
};

export default Header;
