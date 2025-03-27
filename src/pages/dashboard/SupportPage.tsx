
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import Support from '../Support';

interface DashboardLayoutProps {
  children: ReactNode;
}

const SupportPage = () => {
  return (
    <DashboardLayout>
      <Support />
    </DashboardLayout>
  );
};

export default SupportPage;
