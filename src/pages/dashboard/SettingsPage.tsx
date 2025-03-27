
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import Settings from './Settings';

interface DashboardLayoutProps {
  children: ReactNode;
}

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
};

export default SettingsPage;
