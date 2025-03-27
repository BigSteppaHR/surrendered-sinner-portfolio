
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  Search,
  EyeIcon,
  BarChart3,
  Settings,
  User
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sample data - in a real application, this would come from an API
const samplePayments = Array.from({ length: 10 }, (_, i) => {
  const customers = [
    { name: "John Smith", email: "john@example.com", id: "CUST-1234" },
    { name: "Sarah Johnson", email: "sarah@example.com", id: "CUST-2345" },
    { name: "Michael Brown", email: "michael@example.com", id: "CUST-3456" },
    { name: "Emily Davis", email: "emily@example.com", id: "CUST-4567" },
    { name: "Robert Wilson", email: "robert@example.com", id: "CUST-5678" },
    { name: "Jessica Thompson", email: "jessica@example.com", id: "CUST-6789" },
    { name: "David Miller", email: "david@example.com", id: "CUST-7890" },
    { name: "Amanda Anderson", email: "amanda@example.com", id: "CUST-8901" },
    { name: "Daniel Johnson", email: "daniel@example.com", id: "CUST-9012" },
    { name: "Sophia Rodriguez", email: "sophia@example.com", id: "CUST-0123" },
  ];
  
  const plans = [
    { name: "Basic Plan", price: 29.99 },
    { name: "Pro Plan", price: 99.99 },
    { name: "Elite Plan", price: 249.99 },
  ];
  
  const statuses = ["completed", "pending", "failed"];
  const customer = customers[i];
  const plan = plans[i % 3];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const date = subDays(new Date(), i);

  return {
    id: `PAY-${1000 + i}`,
    customerId: customer.id,
    customer: customer.name,
    email: customer.email,
    amount: plan.price,
    plan: plan.name,
    date: date,
    status: status,
    paymentMethod: i % 2 === 0 ? "Credit Card" : "PayPal",
    cardLastFour: i % 2 === 0 ? `${4000 + i}` : null,
  };
});

// Subscription plans data
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

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [stripeKeyInput, setStripeKeyInput] = useState("");
  const [stripeKey, setStripeKey] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<typeof samplePayments[0] | null>(null);
  const { toast } = useToast();

  // Filter payments based on search term and status
  const filteredPayments = samplePayments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStripeKey = () => {
    if (!stripeKeyInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Stripe API key",
        variant: "destructive",
      });
      return;
    }
    
    setStripeKey(stripeKeyInput);
    localStorage.setItem("stripe-key-hint", "configured");
    
    toast({
      title: "Success",
      description: "Stripe API key updated successfully!",
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge>{status}</Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-400 mt-1">Manage payments and subscription plans</p>
        </div>
        <Link to="/payment-portal">
          <Button variant="outline" className="flex items-center gap-2 border-[#1a1a1a] bg-[#0a0a0a]">
            <ExternalLink className="h-4 w-4" />
            Open Payment Portal
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="history">
        <TabsList className="bg-[#1a1a1a] border-b border-[#333]">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-6">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="h-5 w-5 mr-2 text-[#ea384c]" />
                Payment Transactions
              </CardTitle>
              <CardDescription>
                View all payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-[#1a1a1a] gap-4">
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search payments..." 
                      className="pl-9 w-full md:w-64 bg-[#0a0a0a] border-[#1a1a1a]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] w-full md:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Status: {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#1a1a1a]">
                      <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("failed")}>
                        Failed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] w-full md:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1a1a1a] hover:bg-[#1a1a1a]">
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-[#1a1a1a] hover:bg-[#1a1a1a]">
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.customer}</p>
                              <p className="text-xs text-gray-400">{payment.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{payment.plan}</TableCell>
                          <TableCell>{format(payment.date, 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{renderStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => setSelectedPayment(payment)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                                <DialogHeader>
                                  <DialogTitle>Payment Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information about payment {payment.id}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedPayment && (
                                  <>
                                    <div className="grid gap-4 py-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h3 className="text-lg font-bold text-[#ea384c]">Payment #{selectedPayment.id}</h3>
                                          <p className="text-sm text-gray-400">
                                            Processed on {format(selectedPayment.date, 'MMMM dd, yyyy')}
                                          </p>
                                        </div>
                                        {renderStatusBadge(selectedPayment.status)}
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4 border-t border-[#1a1a1a] pt-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-400">Customer Information</h4>
                                          <p className="font-medium">{selectedPayment.customer}</p>
                                          <p className="text-sm">{selectedPayment.email}</p>
                                          <p className="text-sm text-gray-400">Customer ID: {selectedPayment.customerId}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-400">Payment Details</h4>
                                          <p className="font-medium">${selectedPayment.amount.toFixed(2)}</p>
                                          <p className="text-sm">Plan: {selectedPayment.plan}</p>
                                          <p className="text-sm text-gray-400">
                                            Method: {selectedPayment.paymentMethod}
                                            {selectedPayment.cardLastFour && ` (**** ${selectedPayment.cardLastFour})`}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {selectedPayment.status === 'failed' && (
                                        <div className="bg-red-500/10 p-4 rounded-md border border-red-500/20 mt-2">
                                          <h4 className="text-sm font-medium text-red-500 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Payment Failed
                                          </h4>
                                          <p className="text-sm text-gray-400 mt-1">
                                            Reason: Insufficient funds or card declined. Customer has been notified.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                      <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a]">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Receipt
                                      </Button>
                                      
                                      {selectedPayment.status === 'failed' && (
                                        <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
                                          Retry Payment
                                        </Button>
                                      )}
                                    </DialogFooter>
                                  </>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="border-[#1a1a1a]">
                        <TableCell colSpan={7} className="h-40 text-center">
                          <div className="flex flex-col items-center">
                            <CreditCard className="h-10 w-10 text-gray-400 mb-2" />
                            <h3 className="text-lg font-medium mb-1">No payments found</h3>
                            <p className="text-gray-400 max-w-md">
                              {searchTerm || filterStatus !== 'all' 
                                ? "No payments match your current filters. Try adjusting your search criteria."
                                : "Payments will appear here once customers subscribe to your plans."}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#333] transition-all ${selectedPlan === plan.id ? 'ring-2 ring-[#ea384c]' : ''}`}
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
                        <span className="text-[#ea384c] mr-2">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={selectedPlan === plan.id ? "default" : "outline"} 
                    className={selectedPlan === plan.id ? "w-full bg-[#ea384c] hover:bg-[#d32d3f]" : "w-full border-[#1a1a1a] bg-[#0a0a0a]"}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {selectedPlan && (
            <Card className="mt-6 bg-[#0f0f0f] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Add Customer to Plan
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter customer information to process a new subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">Customer Name</label>
                    <Input className="bg-[#0a0a0a] border-[#1a1a1a]" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Email</label>
                    <Input className="bg-[#0a0a0a] border-[#1a1a1a]" type="email" placeholder="email@example.com" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="text-sm font-medium block mb-2">Card Information</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="bg-[#0a0a0a] border-[#1a1a1a] pl-10" placeholder="Card Number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="bg-[#0a0a0a] border-[#1a1a1a] pl-10" placeholder="MM/YY" />
                      </div>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input className="bg-[#0a0a0a] border-[#1a1a1a] pl-10" placeholder="CVC" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full bg-[#ea384c] hover:bg-[#d32d3f]">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Subscription
                  </Button>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {stripeKey ? "Payment will be processed securely via Stripe" : "Configure Stripe API key in Settings to enable payments"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-[#ea384c]" />
                Payment Reports
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate and view payment reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold pb-2">$32,580.45</div>
                    <Button variant="outline" className="w-full mt-2 border-[#1a1a1a]">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Subscription Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold pb-2">87%</div>
                    <Button variant="outline" className="w-full mt-2 border-[#1a1a1a]">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Revenue Per User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold pb-2">$76.50</div>
                    <Button variant="outline" className="w-full mt-2 border-[#1a1a1a]">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Custom Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Report Type</label>
                    <Select>
                      <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectItem value="revenue">Revenue Report</SelectItem>
                        <SelectItem value="subscriptions">Subscriptions Report</SelectItem>
                        <SelectItem value="transactions">Transactions Report</SelectItem>
                        <SelectItem value="churn">Churn Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Date Range</label>
                    <Select>
                      <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Format</label>
                    <Select>
                      <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="mt-4 bg-[#ea384c] hover:bg-[#d32d3f]">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-[#ea384c]" />
                Payment Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure your payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium block mb-2">Stripe API Key</label>
                <div className="flex gap-2">
                  <Input 
                    className="bg-[#0a0a0a] border-[#1a1a1a] flex-1" 
                    type="password" 
                    placeholder="sk_test_..."
                    value={stripeKeyInput}
                    onChange={(e) => setStripeKeyInput(e.target.value)}
                  />
                  <Button onClick={handleUpdateStripeKey} className="bg-[#ea384c] hover:bg-[#d32d3f]">Save</Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {stripeKey ? "Stripe API key is configured" : "Enter your Stripe secret key to enable payment processing"}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Payment Currency</label>
                <Select>
                  <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                    <SelectItem value="aud">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Subscription Billing Day</label>
                <Select>
                  <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue placeholder="Select billing day" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectItem value="signup">Day of signup</SelectItem>
                    <SelectItem value="1">1st of month</SelectItem>
                    <SelectItem value="15">15th of month</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-2">
                  Determines when recurring subscriptions are billed
                </p>
              </div>
              
              <div className="pt-4 border-t border-[#1a1a1a]">
                <h3 className="text-base font-medium mb-4">Payment Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] flex justify-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-[#ea384c]" />
                    Stripe (Connected)
                  </Button>
                  <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] flex justify-start opacity-60">
                    PayPal (Not Connected)
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#1a1a1a]">
                <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a]">
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
