
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import TrainingPlans from './TrainingPlans';

interface DashboardLayoutProps {
  children: ReactNode;
}

const PlanPage = () => {
  return (
    <DashboardLayout>
      <TrainingPlans />
    </DashboardLayout>
  );
};

export default PlanPage;
