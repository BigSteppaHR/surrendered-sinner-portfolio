
import React from 'react';
import { ArrowRight, BadgeCheck, Calendar, Dumbbell, Flame, Heart, LineChart, Clock, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CustomPlanQuiz from './CustomPlanQuiz';

const TrainingPackages = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const packages = [
    {
      id: 'starter',
      name: 'Starter Package',
      description: 'Perfect for beginners looking to establish a fitness routine',
      price: 149,
      features: [
        'Personalized workout plan',
        '1-month program duration',
        'Weekly check-ins',
        'Form technique guidance',
        'Nutrition basics',
      ],
      icon: <Dumbbell className="h-10 w-10 text-white" />,
      color: 'from-zinc-700 to-zinc-900',
      popular: false
    },
    {
      id: 'transformation',
      name: 'Transformation',
      description: 'Comprehensive program for serious fitness transformation',
      price: 299,
      features: [
        'Advanced personalized workout plan',
        '3-month program duration',
        'Bi-weekly coaching calls',
        'Detailed nutrition plan',
        'Progress tracking tools',
        'Supplement recommendations',
        '24/7 messaging support',
      ],
      icon: <Flame className="h-10 w-10 text-white" />,
      color: 'from-sinner-red to-red-900',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite Performance',
      description: 'Premium coaching for maximum results and accountability',
      price: 499,
      features: [
        'Fully customized workout program',
        '6-month program duration',
        'Weekly coaching sessions',
        'Periodized training approach',
        'Advanced nutrition protocols',
        'Body composition analysis',
        'Recovery optimization',
        'Unlimited support access',
      ],
      icon: <LineChart className="h-10 w-10 text-white" />,
      color: 'from-zinc-800 to-black',
      popular: false
    }
  ];

  const addons = [
    {
      id: 'nutrition',
      name: 'Nutrition Coaching',
      description: 'Personalized nutrition plans and coaching',
      price: 99,
      icon: <Heart className="h-6 w-6 text-sinner-red" />
    },
    {
      id: 'sessions',
      name: 'Training Sessions',
      description: '5-pack of personal training sessions',
      price: 299,
      icon: <Users className="h-6 w-6 text-sinner-red" />
    },
    {
      id: 'support',
      name: 'Extended Support',
      description: 'Additional 3 months of coach messaging support',
      price: 149,
      icon: <Headphones className="h-6 w-6 text-sinner-red" />
    }
  ];

  const handlePurchase = (packageId: string) => {
    if (isAuthenticated) {
      navigate(`/dashboard/payment?package=${packageId}`);
    } else {
      navigate('/signup', { state: { redirectAfterLogin: `/dashboard/payment?package=${packageId}` } });
    }
  };

  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
            Training Plans
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Path to Success
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our training packages are designed to meet you where you are and take you where you want to go.
            Each plan includes personalized coaching and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative bg-zinc-900 border-zinc-800 overflow-hidden ${pkg.popular ? 'ring-2 ring-sinner-red shadow-[0_0_20px_rgba(234,56,76,0.3)]' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-sinner-red text-white text-xs uppercase font-bold py-1 px-3 rotate-0">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`h-24 bg-gradient-to-r ${pkg.color} flex items-center justify-center`}>
                <div className="bg-black/30 p-3 rounded-full">
                  {pkg.icon}
                </div>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                  <div className="text-2xl font-bold text-white">${pkg.price}</div>
                </div>
                <CardDescription className="text-gray-400">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <BadgeCheck className="h-5 w-5 text-sinner-red mr-2 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => handlePurchase(pkg.id)}
                  className={`w-full group relative overflow-hidden ${
                    pkg.popular 
                      ? 'bg-sinner-red hover:bg-red-700' 
                      : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sinner-red via-red-600 to-sinner-red bg-[length:200%_100%] animate-shimmer opacity-70"></span>
                  )}
                  <span className="relative flex items-center justify-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mb-16">
          <div className="text-center mb-10">
            <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
              Customize Your Experience
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Training Add-ons
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Enhance your training package with these additional services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addons.map((addon) => (
              <div 
                key={addon.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-start hover:border-zinc-700 transition-colors"
              >
                <div className="bg-zinc-800 p-3 rounded-full mr-4">
                  {addon.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{addon.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{addon.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sinner-red">${addon.price}</span>
                    <Button variant="outline" size="sm" className="text-xs border-zinc-700">
                      Add to Package
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                Not Sure Which Plan Is Right For You?
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Get a Custom Plan Recommendation
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Take our quick fitness assessment quiz to receive a personalized training plan recommendation
                based on your goals, experience level, and preferences.
              </p>
            </div>
            
            <div className="flex justify-center">
              <CustomPlanQuiz />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPackages;
