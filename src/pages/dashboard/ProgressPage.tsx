
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import Progress from '../Progress';

interface DashboardLayoutProps {
  children: ReactNode;
}

const ProgressPage = () => {
  return (
    <DashboardLayout>
      <Progress />
    </DashboardLayout>
  );
};

export default ProgressPage;
