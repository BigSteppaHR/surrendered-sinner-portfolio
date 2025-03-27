
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/SEO';
import { AlertCircle, ChevronLeft, Home, LayoutDashboard, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PaymentCancelled = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <SEO 
        title="Payment Cancelled | Surrendered Sinner Fitness"
        description="Your payment has been cancelled. No charges were made."
        canonical="https://surrenderedsinnerfitness.com/payment-cancelled"
      />
      
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-sinner-red" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            No charges have been made to your account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-center text-gray-400 mb-4">
            Your payment process was cancelled. If you encountered any issues or have questions, feel free to contact our support team.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {isAuthenticated ? (
            <>
              <Button 
                className="w-full bg-sinner-red hover:bg-red-700"
                onClick={() => navigate('/plans-catalog')}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="w-full bg-sinner-red hover:bg-red-700"
                onClick={() => navigate('/plans')}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
