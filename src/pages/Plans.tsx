
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CustomPlanQuiz from '@/components/CustomPlanQuiz';

type PlanFeature = {
  feature: string;
  basic: boolean;
  premium: boolean;
  elite: boolean;
};

const Plans = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  
  const features: PlanFeature[] = [
    { feature: 'Personalized Workout Plan', basic: true, premium: true, elite: true },
    { feature: 'Nutritional Guidance', basic: true, premium: true, elite: true },
    { feature: 'Progress Tracking', basic: true, premium: true, elite: true },
    { feature: 'Community Access', basic: true, premium: true, elite: true },
    { feature: 'Email Support', basic: true, premium: true, elite: true },
    { feature: 'Video Exercise Library', basic: false, premium: true, elite: true },
    { feature: 'Weekly Coach Check-ins', basic: false, premium: true, elite: true },
    { feature: 'Custom Meal Plans', basic: false, premium: true, elite: true },
    { feature: 'Priority Support', basic: false, premium: false, elite: true },
    { feature: '1-on-1 Coaching Sessions', basic: false, premium: false, elite: true },
    { feature: 'Daily Coach Access', basic: false, premium: false, elite: true },
    { feature: 'Exclusive Content Access', basic: false, premium: false, elite: true },
  ];
  
  const getPrice = (base: number): number => {
    return billingCycle === 'annually' ? base * 10 : base;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Training Plans & Pricing | Surrendered Sinner Fitness"
        description="Explore our training plans and pricing options. Find the perfect fitness solution for your goals and budget."
        canonical="https://surrenderedsinnerfitness.com/plans"
      />
      
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-sinner-dark-gray to-black noise-bg py-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">TRAINING <span className="text-sinner-red">PLANS</span></h1>
            <p className="text-lg text-white/80 mb-8">
              Choose the plan that fits your goals and commit to the journey of transformation.
            </p>
            
            <div className="flex justify-center mb-8">
              <div className="bg-zinc-900/50 p-1 rounded-lg inline-flex">
                <Button
                  variant="ghost"
                  className={`${billingCycle === 'monthly' ? 'bg-sinner-red text-white' : 'hover:bg-zinc-800'}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly Billing
                </Button>
                <Button
                  variant="ghost"
                  className={`${billingCycle === 'annually' ? 'bg-sinner-red text-white' : 'hover:bg-zinc-800'}`}
                  onClick={() => setBillingCycle('annually')}
                >
                  Annual Billing
                  <span className="ml-2 bg-green-500 text-xs font-bold py-0.5 px-2 rounded-full text-white">SAVE 15%</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Basic Plan */}
            <Card className="bg-zinc-900/70 border-zinc-800 overflow-hidden shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Basic Plan</CardTitle>
                <CardDescription>Self-guided fitness journey</CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold">${getPrice(49)}</div>
                  <div className="text-sm text-gray-400">{billingCycle === 'monthly' ? 'per month' : 'per month, billed annually'}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {features.map((item, index) => (
                    <li key={index} className="flex items-start">
                      {item.basic ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <span className={item.basic ? 'text-white' : 'text-gray-500'}>{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className="bg-zinc-900/70 border-sinner-red overflow-hidden shadow-xl relative">
              <div className="absolute top-0 right-0 bg-sinner-red text-white text-xs uppercase font-bold py-1 px-3 rounded-bl-lg">
                Popular
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Premium Plan</CardTitle>
                <CardDescription>Guided coaching & support</CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold">${getPrice(99)}</div>
                  <div className="text-sm text-gray-400">{billingCycle === 'monthly' ? 'per month' : 'per month, billed annually'}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {features.map((item, index) => (
                    <li key={index} className="flex items-start">
                      {item.premium ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <span className={item.premium ? 'text-white' : 'text-gray-500'}>{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-sinner-red hover:bg-red-700">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            
            {/* Elite Plan */}
            <Card className="bg-zinc-900/70 border-zinc-800 overflow-hidden shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Elite Plan</CardTitle>
                <CardDescription>Premium 1-on-1 coaching</CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold">${getPrice(199)}</div>
                  <div className="text-sm text-gray-400">{billingCycle === 'monthly' ? 'per month' : 'per month, billed annually'}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {features.map((item, index) => (
                    <li key={index} className="flex items-start">
                      {item.elite ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <span className={item.elite ? 'text-white' : 'text-gray-500'}>{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Not Sure Which Plan Is Right For You?</h2>
              <p className="text-gray-300 mb-6">
                Take our quick quiz to get personalized recommendations based on your fitness goals, experience level, and preferences.
              </p>
              <CustomPlanQuiz />
            </div>
            
            <Separator className="my-16 bg-zinc-800" />
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
                  <p className="text-gray-300">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
                  </p>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Is there a contract or commitment?</h3>
                  <p className="text-gray-300">
                    No long-term contracts. All plans are subscription-based and can be canceled at any time.
                  </p>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">How personalized are the workout plans?</h3>
                  <p className="text-gray-300">
                    All plans include personalization based on your goals, fitness level, and available equipment. The degree of customization increases with higher-tier plans.
                  </p>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">What if I'm not seeing results?</h3>
                  <p className="text-gray-300">
                    We offer a 30-day money-back guarantee if you're not satisfied with your progress. Our coaches will also work with you to adjust your plan if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Plans;
