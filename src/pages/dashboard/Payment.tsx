
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionPlans from "@/components/payment/SubscriptionPlans";
import AddFundsForm from "@/components/payment/AddFundsForm";
import { subscriptionPlans } from "@/components/payment/SubscriptionData";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { checkSupabaseConnection, attemptSupabaseReconnection } from "@/utils/supabaseConnectionChecker";
import { withErrorHandling } from "@/utils/databaseErrorHandler";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Payment = () => {
  const [activeTab, setActiveTab] = useState("subscription");
  const { toast } = useToast();
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<boolean | null>(null);
  const [stripeInitialized, setStripeInitialized] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Check if Stripe is properly initialized
  useEffect(() => {
    const checkStripeInitialization = async () => {
      if (typeof window !== 'undefined') {
        try {
          const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
          const isValidKey = stripeKey && stripeKey.startsWith('pk_');
          
          if (isValidKey) {
            // Test a simple call to see if Stripe API is responding
            try {
              const { data, error } = await supabase.functions.invoke('stripe-helper', {
                body: { 
                  action: 'get-dashboard-data',
                  params: {}
                }
              });
              
              setStripeInitialized(!error && data !== null);
            } catch (e) {
              console.error("Error checking Stripe API:", e);
              setStripeInitialized(false);
            }
          } else {
            setStripeInitialized(false);
          }
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
    setDbConnectionStatus(isConnected);
    
    if (!isConnected) {
      await attemptSupabaseReconnection();
    }
    
    toast({
      title: "Payment System Error",
      description: error,
      variant: "destructive",
    });
  };
  
  // Function to retry Stripe connection
  const retryStripeConnection = async () => {
    setIsRetrying(true);
    setStripeError(null);
    
    try {
      // Attempt to reconnect to the database first if needed
      if (dbConnectionStatus === false) {
        const reconnected = await attemptSupabaseReconnection();
        setDbConnectionStatus(reconnected);
        
        if (!reconnected) {
          throw new Error("Could not connect to the database. Payment functions may be limited.");
        }
      }
      
      // Now try to connect to Stripe
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'get-dashboard-data',
          params: {}
        }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to connect to Stripe");
      }
      
      setStripeInitialized(true);
      toast({
        title: "Connection Restored",
        description: "Successfully connected to the payment system",
      });
    } catch (error: any) {
      console.error("Error retrying Stripe connection:", error);
      setStripeError(error.message || "Failed to connect to payment system");
      setStripeInitialized(false);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to payment system",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Function to retry database connection
  const retryDatabaseConnection = async () => {
    setDbConnectionStatus(null); // Set to loading state
    
    try {
      const reconnected = await attemptSupabaseReconnection();
      setDbConnectionStatus(reconnected);
      
      if (reconnected) {
        toast({
          title: "Connection Restored",
          description: "Successfully connected to the database",
        });
        
        // After reconnecting to the database, also try to reconnect to Stripe
        if (!stripeInitialized) {
          retryStripeConnection();
        }
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the database. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error reconnecting to database:", error);
      setDbConnectionStatus(false);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to database",
        variant: "destructive",
      });
    }
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
              <AlertTitle>Payment System Unavailable</AlertTitle>
              <AlertDescription className="flex flex-col space-y-2">
                <span>The payment system is currently unavailable. Some payment features may be limited.</span>
                <Button 
                  onClick={retryStripeConnection}
                  disabled={isRetrying}
                  variant="destructive" 
                  className="text-white bg-red-800 hover:bg-red-700 self-start mt-2 flex items-center"
                >
                  {isRetrying ? (
                    <>
                      <span className="animate-spin mr-2">
                        <RefreshCcw className="h-4 w-4" />
                      </span>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Retry Connection
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {dbConnectionStatus === false && (
            <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Connection Error</AlertTitle>
              <AlertDescription className="flex flex-col space-y-2">
                <span>Unable to connect to the database. Some features may not work properly.</span>
                <Button 
                  onClick={retryDatabaseConnection}
                  disabled={dbConnectionStatus === null} // Disabled when loading
                  className="text-white bg-red-800 hover:bg-red-700 px-3 py-1 rounded text-sm self-start mt-2 flex items-center"
                >
                  {dbConnectionStatus === null ? (
                    <>
                      <span className="animate-spin mr-2">
                        <RefreshCcw className="h-4 w-4" />
                      </span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Retry Connection
                    </>
                  )}
                </Button>
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
