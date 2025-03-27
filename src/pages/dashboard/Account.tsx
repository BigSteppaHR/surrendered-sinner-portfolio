
import React, { useState, useEffect } from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, Shield, Bell, MailOpen, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import PaymentGateway from '@/components/payment/PaymentGateway';

const Account = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      fetchPaymentHistory();
    }
  }, [profile]);
  
  const fetchPaymentHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-zinc-900 border-zinc-800 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Billing & Payments
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 text-sinner-red mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-sinner-red/30">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-sinner-red/20 text-sinner-red text-xl">
                        {getInitials(profile?.full_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" className="border-zinc-700 text-white">
                        Upload Picture
                      </Button>
                      <Button variant="ghost" className="text-gray-400">
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={email}
                        readOnly
                        className="bg-zinc-800/50 border-zinc-700"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="bg-sinner-red hover:bg-red-700"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Details about your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Last Login</p>
                      <p className="font-medium">
                        {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 text-sinner-red mr-2" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">**** **** **** 4242</p>
                        <p className="text-sm text-gray-400">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Default</Badge>
                  </div>
                  
                  <Button variant="outline" className="border-zinc-700 text-white">
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Review your past payments</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Description</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                              <td className="py-3 px-4">
                                {new Date(payment.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-3 px-4">{payment.description}</td>
                              <td className="py-3 px-4">
                                ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={payment.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                                  {payment.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No payment history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Make a Payment</CardTitle>
                  <CardDescription>Add funds or subscribe to a plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentGateway onSuccess={fetchPaymentHistory} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 text-sinner-red mr-2" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Workout Reminders</Label>
                          <p className="text-sm text-gray-400">Receive reminders about upcoming workouts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Progress Updates</Label>
                          <p className="text-sm text-gray-400">Weekly summaries of your fitness progress</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Account Notifications</Label>
                          <p className="text-sm text-gray-400">Updates about your account or subscription</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Marketing Emails</Label>
                          <p className="text-sm text-gray-400">Receive special offers and promotions</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Push Notifications</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Enable Push Notifications</Label>
                          <p className="text-sm text-gray-400">Allow browser notifications</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-sinner-red hover:bg-red-700">
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-sinner-red mr-2" />
                    Password & Security
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input 
                          id="current-password" 
                          type="password" 
                          className="bg-zinc-800 border-zinc-700" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          className="bg-zinc-800 border-zinc-700" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          className="bg-zinc-800 border-zinc-700" 
                        />
                      </div>
                      
                      <div className="pt-2">
                        <Button className="bg-sinner-red hover:bg-red-700">
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Verification</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Status</p>
                        <div className="flex items-center mt-1">
                          {profile?.email_confirmed ? (
                            <Badge className="bg-green-600">Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-600">Unverified</Badge>
                          )}
                        </div>
                      </div>
                      
                      {!profile?.email_confirmed && (
                        <Button variant="outline" className="border-zinc-700 text-white">
                          Verify Email
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Login Sessions</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {navigator.userAgent}
                          </p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">
                              Active now
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-green-600">Current</Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="border-zinc-700 text-white">
                      Log Out All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// For TypeScript compatibility
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${className}`}>
      {children}
    </span>
  );
};

export default Account;
