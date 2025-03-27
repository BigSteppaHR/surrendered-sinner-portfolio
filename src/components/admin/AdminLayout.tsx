
import React, { ReactNode, useState } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
