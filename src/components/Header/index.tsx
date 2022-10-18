import React, { useContext } from 'react';
import { context } from '@/pages';
import DashboardMenu from '@/components/Dashboard/Menu/DashboardMenu';

type Props = {
  onDashboardMenuClick?: (id: string) => void;
};

const Header = (props: Props) => {
  const { preferences } = useContext(context);
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
        </>
      ) : (
        <>
          <div className="text-left text-white text-xl w-7/12 p-3">
            {preferences.settings.title}
          </div>
          <div className="text-right text-white font-semibold text-3l w-7/12 p-3">
            Powerd By AIGID
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
