import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Bell, Shield, Loader2 } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";

const Settings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    sessionReminders: true,
    marketingEmails: false,
    newFeatures: true,
  });
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      // In a real implementation, this would call updateProfile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Password
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Privacy
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="bg-[#111111] border-[#333333]">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name</Label>
                          <Input
                            id="full-name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-[#1A1A1A] border-[#333333]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#1A1A1A] border-[#333333]"
                            disabled
                          />
                          <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          className="w-full min-h-[100px] rounded-md bg-[#1A1A1A] border border-[#333333] p-2 text-white"
                          placeholder="Tell us about yourself"
                        ></textarea>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card className="bg-[#111111] border-[#333333]">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="bg-[#1A1A1A] border-[#333333]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          className="bg-[#1A1A1A] border-[#333333]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          className="bg-[#1A1A1A] border-[#333333]"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                    >
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card className="bg-[#111111] border-[#333333]">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Updates</h3>
                          <p className="text-sm text-gray-400">Receive emails about your account activity</p>
                        </div>
                        <Switch
                          checked={notifications.emailUpdates}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, emailUpdates: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Session Reminders</h3>
                          <p className="text-sm text-gray-400">Get notifications about upcoming training sessions</p>
                        </div>
                        <Switch
                          checked={notifications.sessionReminders}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, sessionReminders: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Marketing Emails</h3>
                          <p className="text-sm text-gray-400">Receive offers and promotional content</p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">New Features</h3>
                          <p className="text-sm text-gray-400">Get updates about new features and improvements</p>
                        </div>
                        <Switch
                          checked={notifications.newFeatures}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, newFeatures: checked })}
                        />
                      </div>
                    </div>
                    
                    <Button
                      className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card className="bg-[#111111] border-[#333333]">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Activity Tracking</h3>
                          <p className="text-sm text-gray-400">Allow us to collect usage data to improve your experience</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Public Profile</h3>
                          <p className="text-sm text-gray-400">Make your profile visible to other members</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Data Sharing</h3>
                          <p className="text-sm text-gray-400">Allow sharing of anonymized data with our partners</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-[#333333]">
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        This action is permanent and cannot be undone. All your data will be permanently removed.
                      </p>
                    </div>
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

export default Settings;
