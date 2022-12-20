import { createContext, useContext } from 'react';
import useDashboard, { UseDashboardReturn } from './useDashboard';

const DashboardContext = createContext<UseDashboardReturn | null>(null);

export const useDashboardContext = (): UseDashboardReturn => {
  return useContext(DashboardContext) as unknown as UseDashboardReturn;
};

export function DashboardProvider({ children }) {
  const value = useDashboard();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
