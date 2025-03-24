
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionPlans from "@/components/payment/SubscriptionPlans";
import AddFundsForm from "@/components/payment/AddFundsForm";
import { subscriptionPlans } from "@/components/payment/SubscriptionData";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe with a fallback to avoid errors
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QWJOAJ1axkFIKsVApGtDWcUbliJT2kNf90nqUnL3ziUxf3zHANMB6gSKhKkzExWswzuG2pxIa22EqzQA8CD70iZ00LU0YGYQC';
const stripePromise = loadStripe(stripePublishableKey);

const Payment = () => {
  const [activeTab, setActiveTab] = useState("subscription");
  const { toast } = useToast();
  
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="funds">Add Funds</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="space-y-4">
              <SubscriptionPlans plans={subscriptionPlans} />
            </TabsContent>
            
            <TabsContent value="funds">
              <Elements stripe={stripePromise}>
                <AddFundsForm />
              </Elements>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Payment;
