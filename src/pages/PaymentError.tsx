
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const PaymentError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="border-b border-[#333] py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Logo size="small" />
          <span className="ml-4 text-xl font-semibold">Payment Failed</span>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-zinc-900 border border-[#333] rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-400 mb-6">
            We encountered an error processing your payment. Please try again or contact support if the issue persists.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-[#ea384c] hover:bg-red-700"
              onClick={() => navigate('/payment-portal')}
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              className="border-[#333]"
              onClick={() => navigate('/dashboard/support')}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-[#333] py-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Surrendered Sinner Fitness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentError;
