
import React from 'react';
import { ArrowRight, BadgeCheck, Dumbbell, Flame, LineChart, Award, Target, Trophy } from 'lucide-react';
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
      id: 'beginner',
      name: 'Beginner Plan',
      description: 'For those new to structured training and nutrition planning',
      price: 150,
      features: [
        'Personalized training program',
        'Basic nutrition guidance',
        'Form correction advice',
        'Monthly program updates',
        'Email support'
      ],
      icon: <Dumbbell className="h-10 w-10 text-white" />,
      color: 'from-zinc-700 to-zinc-900',
      popular: false
    },
    {
      id: 'intermediate',
      name: 'Intermediate Plan',
      description: 'For experienced lifters seeking optimized programming',
      price: 175,
      features: [
        'Advanced periodized training',
        'Detailed nutrition protocols',
        'Recovery optimization',
        'Bi-weekly check-ins',
        'Priority email support',
        'Supplement recommendations'
      ],
      icon: <Flame className="h-10 w-10 text-white" />,
      color: 'from-zinc-800 to-zinc-900',
      popular: true
    },
    {
      id: 'advanced',
      name: 'Advanced Enhancement Plan',
      description: 'For athletes using performance enhancement requiring specialized protocols',
      price: 299,
      features: [
        'PED-optimized training protocols',
        'Cycle-specific nutrition planning',
        'Health marker monitoring',
        'Weekly check-ins and adjustments',
        '24/7 messaging support',
        'Advanced supplement protocols'
      ],
      icon: <LineChart className="h-10 w-10 text-white" />,
      color: 'from-sinner-red to-red-900',
      popular: true
    },
    {
      id: 'competition',
      name: 'Competition Prep Plan',
      description: 'Comprehensive preparation for bodybuilding competitions',
      price: 399,
      features: [
        'Contest-specific training',
        'Peak week protocols',
        'Stage presentation guidance',
        'Twice-weekly check-ins',
        'Posing feedback',
        'Custom carb cycling',
        '24/7 priority coaching'
      ],
      icon: <Trophy className="h-10 w-10 text-white" />,
      color: 'from-zinc-800 to-black',
      popular: false
    }
  ];

  const addons = [
    {
      id: 'meal-revision',
      name: 'Nutrition Plan Revision',
      description: 'Get your nutrition plan revised based on progress',
      price: 35,
      icon: <Target className="h-6 w-6 text-sinner-red" />
    },
    {
      id: 'program-revision',
      name: 'Training Program Revision',
      description: 'Mid-month program adjustments as needed',
      price: 40,
      icon: <Dumbbell className="h-6 w-6 text-sinner-red" />
    },
    {
      id: 'coaching-advice',
      name: 'Emergency Coaching Call',
      description: '30-minute impromptu coaching session',
      price: 60,
      icon: <Award className="h-6 w-6 text-sinner-red" />
    }
  ];

  const handlePurchase = (packageId: string) => {
    if (isAuthenticated) {
      navigate(`/plans-catalog?package=${packageId}`);
    } else {
      navigate('/signup', { state: { redirectAfterLogin: `/plans-catalog?package=${packageId}` } });
    }
  };

  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
            Specialized Training Plans
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose A Plan Based On Your Level
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our specialized training plans are designed for every level, from beginners to advanced athletes and competition prep.
            Each plan includes personalized coaching tailored to your specific needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
              
              <CardContent className="pb-3">
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
                    pkg.id === 'advanced' || pkg.id === 'intermediate'
                      ? 'bg-sinner-red hover:bg-red-700' 
                      : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {(pkg.id === 'advanced' || pkg.id === 'intermediate') && (
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sinner-red via-red-600 to-sinner-red bg-[length:200%_100%] animate-shimmer opacity-70"></span>
                  )}
                  <span className="relative flex items-center justify-center">
                    Subscribe Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-zinc-700"
                      onClick={() => navigate('/plans-catalog')}
                    >
                      View Options
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
                based on your goals, experience level, and specific needs.
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
