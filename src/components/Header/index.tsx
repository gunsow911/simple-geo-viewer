import React, { useContext } from 'react';
import { context } from '@/pages';
import settings from '@/assets/settings.json';
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
    return settings.dashboard_enable;
  };

  return (
    <header style={headerStyle} className="h-full flex justify-left items-center">
      <div className="text-left text-white text-xl w-3/12 p-3">{preferences.settings.title}</div>
      {dashboardEnable() && (
        <div className="py-2 flex justify-center w-6/12">
          <DashboardMenu />
        </div>
      )}
      <div className="text-right text-white font-semibold text-3l w-3/12 p-3">Powerd By AIGID</div>
    </header>
  );
};

export default Header;
