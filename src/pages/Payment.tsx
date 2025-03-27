
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PaymentGateway from '@/components/payment/PaymentGateway';
import { useAuth } from '@/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';

const Payment = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Payment | Surrendered Sinner Fitness"
        description="Secure payment options for Surrendered Sinner Fitness services and training plans."
        canonical="https://surrenderedsinnerfitness.com/payment"
      />
      
      {isAuthenticated ? (
        <div className="flex min-h-screen">
          <DashboardNav />
          <div className="flex-1 md:ml-64">
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl md:text-4xl font-bold">Payment Options</h1>
                  <p className="text-gray-400 mt-2 max-w-xl mx-auto">
                    Choose between adding funds to your account or subscribing to one of our coaching plans
                  </p>
                </div>
                
                <PaymentGateway />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex-1">
            <div className="relative min-h-[300px] bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
              
              <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black border border-sinner-red/30 shadow-[0_0_15px_rgba(234,56,76,0.3)]">
                  <CreditCard className="h-8 w-8 text-sinner-red" />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
                  Secure Payment
                </h1>
                
                <p className="text-center text-gray-300 max-w-2xl mb-8">
                  Choose your preferred payment option for your fitness journey.
                  All transactions are secure and encrypted.
                </p>
                
                <div className="flex flex-wrap justify-center gap-6 mt-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Shield className="h-5 w-5 text-sinner-red" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CreditCard className="h-5 w-5 text-sinner-red" />
                    <span>Multiple Payment Options</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-sinner-red" />
                    <span>Satisfaction Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container mx-auto py-16 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                    Payment Options
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Choose Your Plan
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Select from our range of payment options to start your fitness journey
                  </p>
                </div>
                
                <PaymentGateway />
              </div>
            </div>
            
            <div className="bg-zinc-900 py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-10">
                    <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                      Payment Security
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Secure Transactions
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                      Your security is our priority. All payments are processed through secure, encrypted channels.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <div className="bg-black/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <Shield className="h-6 w-6 text-sinner-red" />
                        </div>
                        <CardTitle>Encrypted Payments</CardTitle>
                        <CardDescription>
                          All payment data is encrypted using industry-standard SSL technology
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <div className="bg-black/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <CreditCard className="h-6 w-6 text-sinner-red" />
                        </div>
                        <CardTitle>Secure Card Processing</CardTitle>
                        <CardDescription>
                          Card details are processed securely and never stored on our servers
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <div className="bg-black/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <DollarSign className="h-6 w-6 text-sinner-red" />
                        </div>
                        <CardTitle>Money-Back Guarantee</CardTitle>
                        <CardDescription>
                          If you're not satisfied with your purchase, we offer a 30-day money-back guarantee
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section-divider">
              <Separator className="bg-sinner-red/20 h-0.5" />
            </div>
            
            <Footer />
          </div>
        </>
      )}
    </div>
  );
};

export default Payment;
