
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionPlans from "@/components/payment/SubscriptionPlans";
import AddFundsForm from "@/components/payment/AddFundsForm";
import { subscriptionPlans } from "@/components/payment/SubscriptionData";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Payment = () => {
  const [activeTab, setActiveTab] = useState("subscription");
  const { toast } = useToast();
  const [stripeError, setStripeError] = useState<string | null>(null);
  
  // Function to handle Stripe errors from child components
  const handleStripeError = (error: string) => {
    setStripeError(error);
    toast({
      title: "Payment System Error",
      description: error,
      variant: "destructive",
    });
  };
  
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Payment Options</h1>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">
              Choose between adding funds to your account or subscribing to one of our coaching plans
            </p>
          </div>
          
          {stripeError && (
            <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment System Error</AlertTitle>
              <AlertDescription>
                {stripeError}. Please try again later or contact support.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="funds">Add Funds</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="space-y-4">
              <SubscriptionPlans plans={subscriptionPlans} onError={handleStripeError} />
            </TabsContent>
            
            <TabsContent value="funds">
              <AddFundsForm onError={handleStripeError} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Payment;
