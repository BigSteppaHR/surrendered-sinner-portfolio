
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionPlans from "@/components/payment/SubscriptionPlans";
import AddFundsForm from "@/components/payment/AddFundsForm";
import { subscriptionPlans } from "@/components/payment/SubscriptionData";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { checkSupabaseConnection, attemptSupabaseReconnection } from "@/utils/supabaseConnectionChecker";
import { withErrorHandling } from "@/utils/databaseErrorHandler";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const [activeTab, setActiveTab] = useState("subscription");
  const { toast } = useToast();
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<boolean | null>(null);
  const [stripeInitialized, setStripeInitialized] = useState<boolean>(false);
  
  // Check if Stripe is properly initialized
  useEffect(() => {
    // Basic check - if window.Stripe exists, we assume the library loaded
    const checkStripeInitialization = () => {
      if (typeof window !== 'undefined') {
        try {
          const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
          const isValidKey = stripeKey && stripeKey.startsWith('pk_');
          setStripeInitialized(isValidKey);
        } catch (e) {
          console.error("Error checking Stripe initialization:", e);
          setStripeInitialized(false);
        }
      }
    };
    
    checkStripeInitialization();
  }, []);
  
  // Check database connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setDbConnectionStatus(isConnected);
      
      // If not connected, attempt reconnection
      if (!isConnected) {
        const reconnected = await attemptSupabaseReconnection();
        setDbConnectionStatus(reconnected);
      }
    };
    
    checkConnection();
  }, []);
  
  // Function to handle Stripe errors from child components
  const handleStripeError = async (error: string) => {
    setStripeError(error);
    
    // Check if error might be related to database connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      await attemptSupabaseReconnection();
    }
    
    toast({
      title: "Payment System Error",
      description: error,
      variant: "destructive",
    });
  };
  
  // Function to retry database operations
  const retryDatabaseConnection = async () => {
    setDbConnectionStatus(null); // Set to loading state
    const reconnected = await attemptSupabaseReconnection();
    setDbConnectionStatus(reconnected);
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
          
          {!stripeInitialized && (
            <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Configuration Issue</AlertTitle>
              <AlertDescription>
                The payment system is not properly configured. Some payment features may be limited to test mode only.
                {import.meta.env.DEV && " In development mode, a test Stripe key is being used."}
              </AlertDescription>
            </Alert>
          )}
          
          {dbConnectionStatus === false && (
            <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Connection Error</AlertTitle>
              <AlertDescription className="flex flex-col space-y-2">
                <span>Unable to connect to the database. Some features may not work properly.</span>
                <button 
                  onClick={retryDatabaseConnection}
                  className="text-white bg-red-800 hover:bg-red-700 px-3 py-1 rounded text-sm self-start mt-2"
                >
                  Retry Connection
                </button>
              </AlertDescription>
            </Alert>
          )}
          
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
              <TabsTrigger value="subscription" className="text-white bg-[#333] hover:bg-[#444]">Subscription</TabsTrigger>
              <TabsTrigger value="funds" className="text-white bg-[#333] hover:bg-[#444]">Add Funds</TabsTrigger>
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
