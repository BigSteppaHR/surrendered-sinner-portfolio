
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import Schedule from '../Schedule';

interface DashboardLayoutProps {
  children: ReactNode;
}

const SchedulePage = () => {
  return (
    <DashboardLayout>
      <Schedule />
    </DashboardLayout>
  );
};

export default SchedulePage;
