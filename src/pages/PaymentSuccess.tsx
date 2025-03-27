
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Could fetch updated user data here if needed
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="border-b border-[#333] py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Logo size="small" />
          <span className="ml-4 text-xl font-semibold">Payment Successful</span>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-zinc-900 border border-[#333] rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-400 mb-6">
            Your payment has been processed successfully. Your account has been updated with the new funds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-[#ea384c] hover:bg-red-700"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="border-[#333]"
              onClick={() => navigate('/payment-portal')}
            >
              View Payment History
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

export default PaymentSuccess;
