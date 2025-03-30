
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { subscriptionPlans, subscriptionAddons } from "./SubscriptionData";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function SubscriptionPlans({ initialSelectedPlan = null, quizResultId = null }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(initialSelectedPlan);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [showAddonDialog, setShowAddonDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total price based on plan and selected addons
  const calculateTotal = () => {
    let total = 0;
    
    // Add plan price if selected
    if (selectedPlan) {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (plan) total += plan.priceValue;
    }
    
    // Add selected addons
    selectedAddons.forEach(addon => {
      total += addon.price;
    });
    
    return total;
  };

  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setSelectedAddons([]);
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "default",
      });
      navigate('/login', { state: { returnTo: '/plans-catalog' } });
      return;
    }

    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a plan first",
        variant: "destructive",
      });
      return;
    }

    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) {
      toast({
        title: "Plan not found",
        description: "The selected plan could not be found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: sessionData, error } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'create_checkout_session',
          data: {
            planId: plan.id,
            planType: plan.name,
            planName: plan.name,
            price: plan.priceValue,
            addons: selectedAddons,
            quizResultId: quizResultId
          }
        }
      });

      if (error) throw error;
      if (!sessionData?.url) throw new Error('No checkout URL received');

      // Redirect to checkout
      window.location.href = sessionData.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment error",
        description: "Could not initialize payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open addon selection dialog
  const openAddonDialog = () => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a plan first",
        variant: "default",
      });
      return;
    }
    setShowAddonDialog(true);
  };

  // Toggle addon selection
  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(item => item.id === addon.id);
      if (exists) {
        return prev.filter(item => item.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Filtering addons based on the selected plan
  const getRelevantAddons = () => {
    if (!selectedPlan) return [];
    
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (plan && plan.addons) {
      // Return all addons but mark plan-specific ones as recommended
      return subscriptionAddons.map(addon => ({
        ...addon,
        recommended: !!plan.addons.find(a => a.id === addon.id)
      }));
    }
    
    return subscriptionAddons;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`border-2 hover:shadow-lg transition-shadow ${
              selectedPlan === plan.id 
                ? "border-red-600 bg-black" 
                : "border-gray-700 bg-gray-900"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.id === "premium" && (
                  <Badge className="bg-red-600">Best Value</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-lg font-bold text-white">
                {plan.price}
              </CardDescription>
              <CardDescription className="text-gray-300">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <h4 className="text-sm font-medium text-gray-200">Features include:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="mr-2 h-4 w-4 text-green-500 mt-1" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                className={`w-full ${
                  selectedPlan === plan.id 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {selectedPlan === plan.id ? "Selected" : "Choose Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedPlan && (
        <div className="mt-8 text-center">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={openAddonDialog}
              className="mr-4 border-red-500 text-red-500 hover:bg-red-900 hover:text-white"
            >
              <Info className="mr-2 h-4 w-4" /> Customize with Add-ons
            </Button>
            
            <Button 
              onClick={handleCheckout} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Processing<span className="loading loading-dots ml-2"></span></>
              ) : (
                `Subscribe Now - ${formatPrice(calculateTotal())}/month`
              )}
            </Button>
          </div>
          
          {selectedAddons.length > 0 && (
            <div className="text-sm text-gray-400">
              {selectedPlan && (
                <p className="mb-1">
                  Base plan: {formatPrice(subscriptionPlans.find(p => p.id === selectedPlan)?.priceValue || 0)}/month
                </p>
              )}
              {selectedAddons.map(addon => (
                <p key={addon.id} className="mb-1">
                  + {addon.name}: {formatPrice(addon.price)} (one-time)
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Add-on selection dialog */}
      <Dialog open={showAddonDialog} onOpenChange={setShowAddonDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Customize Your Plan</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enhance your experience with these optional add-ons.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {getRelevantAddons().map((addon) => (
              <div key={addon.id} className="flex items-start space-x-3 border-b border-gray-800 pb-3">
                <Checkbox
                  id={`addon-${addon.id}`}
                  checked={selectedAddons.some(a => a.id === addon.id)}
                  onCheckedChange={() => toggleAddon(addon)}
                  className="mt-1"
                />
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <Label htmlFor={`addon-${addon.id}`} className="font-medium">
                      {addon.name} - {formatPrice(addon.price)}
                    </Label>
                    {addon.recommended && (
                      <Badge className="ml-2 bg-red-600">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{addon.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setSelectedAddons([])}
              className="text-gray-400"
            >
              Clear All
            </Button>
            <Button 
              type="submit" 
              onClick={() => setShowAddonDialog(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              Save Selections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
