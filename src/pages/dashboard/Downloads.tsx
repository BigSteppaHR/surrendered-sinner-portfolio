
import React from 'react';
import FileDownloads from '@/components/dashboard/FileDownloads';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DashboardDownloads = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Allow a brief delay for auth state to settle
    const timer = setTimeout(() => setIsPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isLoading && !isPageLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, isPageLoading, navigate]);
  
  // If still loading, show a loading spinner
  if (isLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If not authenticated, explicitly return null or a placeholder
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Training Materials</h1>
            <p className="text-gray-400">
              Access and download your personalized training plans and materials
            </p>
          </div>
          
          <FileDownloads />
        </div>
      </div>
    </div>
  );
};

export default DashboardDownloads;
