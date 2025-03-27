
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, User, DollarSign, Save, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
}

const CreateInvoice = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    amount: '',
    description: '',
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    currency: 'USD',
    status: 'pending'
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: "destructive",
        title: "Failed to load customers",
        description: "There was an error loading the customer list."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    if (selectedCustomer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        customer_name: selectedCustomer.full_name || 'Unknown',
        customer_email: selectedCustomer.email || ''
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name) {
      toast({
        variant: "destructive",
        title: "Missing customer information",
        description: "Please select a customer or enter customer details."
      });
      return;
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the invoice
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: formData.customer_id || null,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          due_date: formData.due_date,
          status: formData.status,
          issued_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Invoice created",
        description: `Invoice #${data.id} has been created successfully.`
      });
      
      navigate('/admin/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        variant: "destructive",
        title: "Failed to create invoice",
        description: "There was an error creating the invoice. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Create New Invoice</h1>
            <p className="text-gray-400 mt-1">Generate a new invoice for a customer</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center border-[#333]"
            onClick={() => navigate('/admin/invoices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select 
                    onValueChange={handleCustomerChange}
                    value={formData.customer_id}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                      {isLoading ? (
                        <div className="flex justify-center py-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#ea384c] border-r-transparent"></div>
                        </div>
                      ) : customers.length > 0 ? (
                        customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.full_name || 'Unknown'} ({customer.email})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-400">
                          No customers found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    className="bg-[#0a0a0a] border-[#1a1a1a]"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Customer Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    className="bg-[#0a0a0a] border-[#1a1a1a]"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="pl-9 bg-[#0a0a0a] border-[#1a1a1a]"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    className="bg-[#0a0a0a] border-[#1a1a1a] min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Invoice for training services..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="due_date"
                        type="date"
                        className="pl-9 bg-[#0a0a0a] border-[#1a1a1a]"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              className="mr-2 border-[#1a1a1a]"
              onClick={() => navigate('/admin/invoices')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#ea384c] hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateInvoice;
