
import { useState } from "react";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  DollarSign, 
  Package, 
  Settings,
  Users,
  CheckCircle,
  Clock
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminPayments = () => {
  const { toast } = useToast();
  const [stripeKey, setStripeKey] = useState("sk_test_*************************************");
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-gray-400">Manage membership plans and payment settings</p>
          </div>
        </div>
        
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="plans">
              <Package className="h-4 w-4 mr-2" />
              Membership Plans
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Payment Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Membership Plans
                </CardTitle>
                <CardDescription>
                  Configure your membership plans and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium mb-2">Ready to configure your plans</h3>
                  <p className="text-gray-400 mb-4 max-w-md mx-auto">
                    This section will let you configure your membership plans and pricing structure that's synchronized with your Stripe account.
                  </p>
                  <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
                    Configure Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <DollarSign className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View all payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-4 border-b border-[#333333]">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search transactions..." 
                      className="w-64 bg-[#1A1A1A] border-[#333333]" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-[#333333]">
                      Export
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="text-center">
                      <TableCell colSpan={5} className="py-10">
                        <div className="flex flex-col items-center">
                          <CreditCard className="h-10 w-10 text-gray-400 mb-2" />
                          <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
                          <p className="text-gray-400 max-w-md">
                            Transactions from your Stripe account will appear here automatically.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Settings className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure your payment provider and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Provider</h3>
                  <div className="flex items-center bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                    <div className="h-10 w-10 bg-white/10 rounded flex items-center justify-center mr-4">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Stripe</h4>
                      <p className="text-sm text-gray-400">Connected to your Stripe account</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripe-key"
                      value={stripeKey}
                      readOnly
                      className="bg-[#1A1A1A] border-[#333333] font-mono"
                    />
                    <div className="absolute top-0 right-0 p-2 text-xs text-gray-500">
                      <Badge variant="outline" className="border-[#333333]">
                        <Clock className="h-3 w-3 mr-1" /> Configured
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Stripe keys are securely managed and synchronized with your Stripe account.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <div className="relative">
                    <Input
                      id="webhook-url"
                      value="https://tcxwvsyfqjcgglyqlahl.supabase.co/functions/v1/stripe-webhook"
                      readOnly
                      className="bg-[#1A1A1A] border-[#333333] font-mono"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-0 right-0 m-1 border-[#333333]"
                      onClick={() => {
                        navigator.clipboard.writeText("https://tcxwvsyfqjcgglyqlahl.supabase.co/functions/v1/stripe-webhook");
                        toast({
                          title: "Copied to clipboard",
                          description: "Webhook URL has been copied to your clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Configure this URL in your Stripe Dashboard webhook settings.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-[#333333]">
                  <Button 
                    className="bg-[#ea384c] hover:bg-[#d32d3f]"
                    onClick={() => {
                      toast({
                        title: "Payment settings saved",
                        description: "Your payment settings have been updated successfully",
                      });
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
