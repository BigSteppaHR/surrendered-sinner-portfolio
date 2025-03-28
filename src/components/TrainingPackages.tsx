
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket } from 'lucide-react';

const TrainingPackages = () => {
  const packages = [
    {
      id: 'nutrition-plan',
      name: 'Nutrition Plan',
      price: '$150',
      monthly: 'starting at',
      features: [
        'Personalized macronutrient calculations',
        'Custom meal plans based on preferences',
        'Supplement recommendations',
        'Hydration guidelines',
        'Nutritional adjustments based on progress'
      ],
      popular: false,
      buttonText: 'Get Started',
      isMonthly: true,
    },
    {
      id: 'lifting-program',
      name: 'Lifting Program',
      price: '$175',
      monthly: 'starting at',
      features: [
        'Customized training split',
        'Progressive overload programming',
        'Exercise selection based on goals',
        'Video demonstration links',
        'Monthly program updates'
      ],
      popular: true,
      buttonText: 'Get Started',
      isMonthly: true,
    },
    {
      id: 'premium-coaching',
      name: 'Premium Coaching',
      price: '$300',
      monthly: 'starting at',
      features: [
        'Comprehensive nutrition planning',
        'Detailed workout programming',
        'Weekly check-ins and adjustments',
        'Direct messaging support',
        'Progress tracking and analysis'
      ],
      popular: false,
      buttonText: 'Get Started',
      isMonthly: true,
    }
  ];

  // For the add-ons section, add this after the main packages section
  const AddOns = () => {
    const addOns = [
      {
        id: 'meal-revision',
        name: 'Meal Plan Revision',
        description: 'Fine-tune your existing meal plan based on progress and preferences',
        price: '$50',
      },
      {
        id: 'lifting-revision',
        name: 'Lifting Plan Revision',
        description: 'Update your training program for continued progress and variety',
        price: '$60',
      },
      {
        id: 'coaching-advice',
        name: 'Impromptu Coaching',
        description: 'On-the-spot advice for training, nutrition or competition questions',
        price: '$40',
      },
      {
        id: 'progress-analysis',
        name: 'Progress Picture Analysis',
        description: 'Detailed feedback and analysis of your physique progress photos',
        price: '$45',
      }
    ];
    
    return (
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">Optional Add-Ons</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {addOns.map(addon => (
            <Card key={addon.id} className="bg-zinc-900 border-[#333]">
              <CardHeader>
                <CardTitle className="text-xl">{addon.name}</CardTitle>
                <div className="text-2xl font-bold text-[#ea384c]">{addon.price}</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{addon.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 border border-[#ea384c]/20">
                  Add to Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Our <span className="text-[#ea384c]">Training Packages</span>
          </h2>
          <p className="text-gray-400">
            Achieve your fitness goals with our customized training plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="bg-zinc-900 border-[#333] relative">
              {pkg.popular && (
                <div className="absolute top-4 left-4 bg-[#ea384c] text-white text-xs font-bold py-1 px-2 rounded-md z-10">
                  Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {pkg.monthly} <span className="text-4xl text-[#ea384c]">{pkg.price}</span> / month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-none space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="text-gray-300 flex items-center">
                      <Rocket className="h-4 w-4 mr-2 text-[#ea384c]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="justify-center">
                <Button className="bg-[#ea384c] hover:bg-[#c42e3e]">
                  {pkg.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <AddOns />
      </div>
    </section>
  );
};

export default TrainingPackages;
