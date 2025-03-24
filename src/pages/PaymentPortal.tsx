
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const PaymentPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDetails, setInvoiceDetails] = useState('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const handleQuickPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPayment(true);
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    // Redirect to payment page with parameters
    navigate(`/payment?amount=${amountInCents}&description=${encodeURIComponent(description || 'Custom payment')}&email=${encodeURIComponent(email || '')}`);
  };

  const handleInvoicePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid invoice amount",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPayment(true);
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    // Create invoice description
    const invoiceDesc = `Invoice #${invoiceNumber || 'N/A'}${invoiceDetails ? ': ' + invoiceDetails : ''}`;
    
    // Redirect to payment page with parameters
    navigate(`/payment?amount=${amountInCents}&description=${encodeURIComponent(invoiceDesc)}&email=${encodeURIComponent(email || '')}&product=Invoice%20Payment`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Payment Portal | Surrendered Sinner Fitness"
        description="Create custom payments and invoices with Surrendered Sinner Fitness."
        canonical="https://surrenderedsinnerfitness.com/payment-portal"
      />
      
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-sinner-dark-gray to-black noise-bg py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Payment Portal</h1>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Create Payment</CardTitle>
              <CardDescription className="text-gray-400">
                Send a payment link or process a payment for your client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quick-pay" className="space-y-6">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="quick-pay">Quick Payment</TabsTrigger>
                  <TabsTrigger value="invoice">Invoice</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quick-pay">
                  <form onSubmit={handleQuickPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Customer Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Personal training session"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-4"
                      disabled={isCreatingPayment}
                    >
                      {isCreatingPayment ? "Creating..." : "Create Payment Link"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="invoice">
                  <form onSubmit={handleInvoicePayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-number">Invoice Number</Label>
                      <Input
                        id="invoice-number"
                        placeholder="INV-12345"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoice-amount">Amount ($)</Label>
                      <Input
                        id="invoice-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoice-email">Customer Email (Optional)</Label>
                      <Input
                        id="invoice-email"
                        type="email"
                        placeholder="customer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoice-details">Invoice Details (Optional)</Label>
                      <Textarea
                        id="invoice-details"
                        placeholder="Service details, dates, etc."
                        value={invoiceDetails}
                        onChange={(e) => setInvoiceDetails(e.target.value)}
                        className="bg-gray-800 border-gray-700 min-h-24"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-4"
                      disabled={isCreatingPayment}
                    >
                      {isCreatingPayment ? "Creating..." : "Create Invoice Payment"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>All payments are processed securely through Stripe.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentPortal;
