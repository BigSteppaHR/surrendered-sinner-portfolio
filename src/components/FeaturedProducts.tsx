
import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Performance Whey Protein',
      description: 'High-quality protein to support muscle recovery and growth.',
      price: '$49.99',
      image: '/placeholder.svg',
      url: '/supplements'
    },
    {
      id: 2,
      name: 'Training Resistance Bands',
      description: 'Complete set of resistance bands for home or gym workouts.',
      price: '$34.99',
      image: '/placeholder.svg',
      url: '/supplements'
    },
    {
      id: 3,
      name: 'Surrendered Sinner Apparel',
      description: 'Premium workout apparel that performs as hard as you do.',
      price: '$29.99',
      image: '/placeholder.svg',
      url: '/supplements'
    }
  ];

  return (
    <section id="shop" className="py-20 bg-black noise-bg">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-sinner-red">Premium</span> Products
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Elevate your training with our carefully selected fitness essentials designed to maximize your performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-sinner-red/50 transition-all duration-300 h-full">
              <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-white/70 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sinner-red font-bold">{product.price}</span>
                  <Link 
                    to={product.url}
                    className="text-white hover:text-sinner-red transition-colors flex items-center"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            className="bg-sinner-red hover:bg-red-700 text-white font-bold"
            size="lg"
            asChild
          >
            <Link 
              to="/supplements"
              className="flex items-center"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Visit Our Store
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
