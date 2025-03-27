import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Filter, Search, DollarSign, Users, Calendar, BarChart4 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";

export interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "processing" | "failed";
  payment_method: string;
  description: string | null;
  created_at: string;
  stripe_payment_id: string;
  customer: {
    email: string | null;
    full_name: string | null;
  };
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            *,
            customer:profiles(email, full_name)
          `)
          .order('created_at', { ascending: false });
        
        if (paymentsError) throw paymentsError;
        
        // Fetch customers with payments
        const { data: customersData, error: customersError } = await supabase
          .from('profiles')
          .select('*')
          .not('stripe_customer_id', 'is', null);
          
        if (customersError) throw customersError;
        
        // Calculate total revenue
        const revenue = paymentsData.reduce((acc, payment) => {
          if (payment.status === 'succeeded') {
            return acc + payment.amount;
          }
          return acc;
        }, 0);
        
        setPayments(paymentsData);
        setCustomers(customersData);
        setTotalRevenue(revenue);
        setCustomerCount(customersData.length);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const filteredPayments = payments.filter(payment => {
    const customerName = payment.customer?.full_name?.toLowerCase() || '';
    const customerEmail = payment.customer?.email?.toLowerCase() || '';
    const searchMatch = 
      customerName.includes(searchTerm.toLowerCase()) || 
      customerEmail.includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const statusMatch = selectedStatus ? payment.status === selectedStatus : true;
    
    return searchMatch && statusMatch;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };
  
  const formatCurrency = (amount: number, currency: string = 'usd') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    // Convert from cents to dollars
    return formatter.format(amount / 100);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage and track payment activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-1">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" className="h-9 gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-sinner-red mr-1" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">From {payments.length} payments</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 text-sinner-red mr-1" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-gray-500 mt-1">With active subscriptions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 text-sinner-red mr-1" />
              Last Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0 ? formatDate(payments[0].created_at) : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.length > 0 ? formatCurrency(payments[0].amount) : 'No payments'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart4 className="h-4 w-4 text-sinner-red mr-1" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0
                ? `${Math.round((payments.filter(p => p.status === 'succeeded').length / payments.length) * 100)}%`
                : '0%'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Of total payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="h-9 bg-zinc-800">
            <TabsTrigger value="all" onClick={() => setSelectedStatus(null)}>All</TabsTrigger>
            <TabsTrigger value="succeeded" onClick={() => setSelectedStatus('succeeded')}>Successful</TabsTrigger>
            <TabsTrigger value="processing" onClick={() => setSelectedStatus('processing')}>Processing</TabsTrigger>
            <TabsTrigger value="failed" onClick={() => setSelectedStatus('failed')}>Failed</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email or description..."
              className="pl-8 bg-zinc-800 border-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="pt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="w-[250px]">Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin h-6 w-6 border-4 border-sinner-red border-t-transparent rounded-full mb-3"></div>
                          <p className="text-sm text-gray-500">Loading payment data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.customer?.full_name || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">{payment.customer?.email || 'No email'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.description || 'No description'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <CreditCard className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-sm text-gray-500">No matching payments found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="succeeded" className="pt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="w-[250px]">Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin h-6 w-6 border-4 border-sinner-red border-t-transparent rounded-full mb-3"></div>
                          <p className="text-sm text-gray-500">Loading payment data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.filter(payment => payment.status === 'succeeded').length > 0 ? (
                    filteredPayments.filter(payment => payment.status === 'succeeded').map((payment) => (
                      <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.customer?.full_name || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">{payment.customer?.email || 'No email'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.description || 'No description'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <CreditCard className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-sm text-gray-500">No matching payments found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="processing" className="pt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="w-[250px]">Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin h-6 w-6 border-4 border-sinner-red border-t-transparent rounded-full mb-3"></div>
                          <p className="text-sm text-gray-500">Loading payment data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.filter(payment => payment.status === 'processing').length > 0 ? (
                    filteredPayments.filter(payment => payment.status === 'processing').map((payment) => (
                      <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.customer?.full_name || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">{payment.customer?.email || 'No email'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.description || 'No description'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <CreditCard className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-sm text-gray-500">No matching payments found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="failed" className="pt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="w-[250px]">Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin h-6 w-6 border-4 border-sinner-red border-t-transparent rounded-full mb-3"></div>
                          <p className="text-sm text-gray-500">Loading payment data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.filter(payment => payment.status === 'failed').length > 0 ? (
                    filteredPayments.filter(payment => payment.status === 'failed').map((payment) => (
                      <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.customer?.full_name || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">{payment.customer?.email || 'No email'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.description || 'No description'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <CreditCard className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-sm text-gray-500">No matching payments found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
