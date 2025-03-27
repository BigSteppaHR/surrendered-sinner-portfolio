
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import Account from './Account';

interface DashboardLayoutProps {
  children: ReactNode;
}

const AccountPage = () => {
  return (
    <DashboardLayout>
      <Account />
    </DashboardLayout>
  );
};

export default AccountPage;
