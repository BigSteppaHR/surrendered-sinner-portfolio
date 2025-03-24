import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, DollarSign, CalendarClock, AlertCircle, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 29.99,
    period: "month",
    features: ["Basic workout plan", "Email support", "Access to community"]
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 99.99,
    period: "month",
    features: ["Advanced workout plan", "Priority support", "Personalized coaching", "Exclusive content"]
  },
  {
    id: "elite",
    name: "Elite Plan",
    price: 249.99,
    period: "month",
    features: ["Ultimate workout plan", "1-on-1 video coaching", "Custom nutrition plan", "24/7 support access", "Exclusive workshops"]
  }
];

const paymentHistory = [
  { id: "PAY-1234", customer: "John Doe", email: "john@example.com", amount: "$99.99", plan: "Pro Plan", date: "2023-08-12", status: "Completed" },
  { id: "PAY-2345", customer: "Sarah Johnson", email: "sarah@example.com", amount: "$29.99", plan: "Basic Plan", date: "2023-08-10", status: "Completed" },
  { id: "PAY-3456", customer: "Michael Brown", email: "michael@example.com", amount: "$249.99", plan: "Elite Plan", date: "2023-08-09", status: "Completed" },
  { id: "PAY-4567", customer: "Emily Davis", email: "emily@example.com", amount: "$99.99", plan: "Pro Plan", date: "2023-08-07", status: "Failed" },
  { id: "PAY-5678", customer: "Robert Wilson", email: "robert@example.com", amount: "$29.99", plan: "Basic Plan", date: "2023-08-05", status: "Completed" },
];

const AdminPayments = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [stripeKeyInput, setStripeKeyInput] = useState("");
  const [stripeKey, setStripeKey] = useState<string | null>(null);

  const handleUpdateStripeKey = () => {
    setStripeKey(stripeKeyInput);
    localStorage.setItem("stripe-key-hint", "configured");
    alert("Stripe key updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Link to="/payment-portal">
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Payment Portal
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="plans">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-gray-900 border-gray-800 transition-all ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    ${plan.price} / {plan.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-primary mr-2">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={selectedPlan === plan.id ? "default" : "outline"} 
                    className="w-full"
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedPlan && (
            <Card className="mt-6 bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter customer information to process payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">Customer Name</label>
                    <Input className="bg-gray-800 border-gray-700" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Email</label>
                    <Input className="bg-gray-800 border-gray-700" type="email" placeholder="email@example.com" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="text-sm font-medium block mb-2">Card Information</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="bg-gray-800 border-gray-700 pl-10" placeholder="Card Number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <CalendarClock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="bg-gray-800 border-gray-700 pl-10" placeholder="MM/YY" />
                      </div>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="bg-gray-800 border-gray-700 pl-10" placeholder="CVC" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {stripeKey ? "Payment will be processed securely via Stripe" : "Configure Stripe API key in Settings to enable payments"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription className="text-gray-400">
                Recent payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id} className="border-gray-800">
                      <TableCell className="text-xs">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.customer}</p>
                          <p className="text-xs text-gray-400">{payment.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {payment.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure your payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium block mb-2">Stripe API Key</label>
                <div className="flex gap-2">
                  <Input 
                    className="bg-gray-800 border-gray-700 flex-1" 
                    type="password" 
                    placeholder="sk_test_..."
                    value={stripeKeyInput}
                    onChange={(e) => setStripeKeyInput(e.target.value)}
                  />
                  <Button onClick={handleUpdateStripeKey}>Save</Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {stripeKey ? "Stripe API key is configured" : "Enter your Stripe secret key to enable payment processing"}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Payment Currency</label>
                <select className="w-full h-10 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm">
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <Button variant="outline" className="w-full">
                  Test Payment Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
