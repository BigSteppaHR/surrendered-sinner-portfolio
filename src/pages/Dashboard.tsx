
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
    
    // If authenticated but email not confirmed, redirect to confirmation page
    if (!isLoading && isAuthenticated && profile && !profile.email_confirmed) {
      navigate("/confirm-email", { state: { email: profile.email } });
    }
  }, [isAuthenticated, isLoading, profile, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-4">Welcome to your Surrendered Sinner dashboard!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Training</h2>
            <p>No active training plans.</p>
            <button className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Start Training</button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
            <p>No upcoming sessions scheduled.</p>
            <button className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Schedule Session</button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <p>Track your fitness journey here.</p>
            <button className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">View Progress</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
