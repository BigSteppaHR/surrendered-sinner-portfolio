
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to payment portal after 5 seconds
    const timer = setTimeout(() => {
      navigate('/payment-portal');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="medium" />
        </div>
        
        <Card className="bg-zinc-900 border-[#333]">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 mx-auto bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-center">Payment Successful</CardTitle>
            <CardDescription className="text-center">
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Thank you for your payment. Your account has been updated with the funds.
            </p>
            <p className="text-sm text-gray-400">
              You will be redirected to the payment portal automatically in a few seconds.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button 
              className="bg-[#ea384c] hover:bg-red-700"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center">
          <Link to="/payment-portal" className="text-sm text-gray-400 hover:text-white">
            Return to payment portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
