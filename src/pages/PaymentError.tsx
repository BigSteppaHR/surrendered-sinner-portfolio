
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Logo from '@/components/Logo';

const PaymentError = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="medium" />
        </div>
        
        <Card className="bg-zinc-900 border-[#333]">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 mx-auto bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-center">Payment Failed</CardTitle>
            <CardDescription className="text-center">
              We encountered a problem processing your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Your payment could not be processed. This could be due to insufficient funds, incorrect payment details, or a temporary issue with the payment provider.
            </p>
            <p className="text-sm text-gray-400">
              No charges have been made to your account. Please try again or use a different payment method.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button 
              className="bg-[#ea384c] hover:bg-red-700"
              onClick={() => navigate('/payment-portal')}
            >
              Try Again
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center">
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
