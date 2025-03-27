
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import Payment from '../Payment';

interface DashboardLayoutProps {
  children: ReactNode;
}

const PaymentPage = () => {
  return (
    <DashboardLayout>
      <Payment />
    </DashboardLayout>
  );
};

export default PaymentPage;
