
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Database, Globe, Mail, Shield, Users, Wrench } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const AdminSettings = () => {
  const { toast } = useToast();
  
  // Mock settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Fitness Training',
    siteDescription: 'Professional fitness training services',
    contactEmail: 'support@fitnesstraining.com',
    publicRegistration: true,
    maintenanceMode: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    emailProvider: 'smtp',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'smtp_user',
    smtpPassword: '********',
    defaultFromEmail: 'no-reply@fitnesstraining.com',
    defaultFromName: 'Fitness Training'
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: 14, // days
    maxLoginAttempts: 5
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    adminNewUser: true,
    adminNewPayment: true,
    adminNewSupportTicket: true,
    userWelcome: true,
    userPasswordReset: true,
    userPaymentConfirmation: true,
    userSupportTicketUpdate: true
  });
  
  // Handle form submissions
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Settings updated',
      description: 'General settings have been saved successfully.',
    });
  };
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Email settings updated',
      description: 'Email configuration has been saved successfully.',
    });
  };
  
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Security settings updated',
      description: 'Security configuration has been saved successfully.',
    });
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Notification settings updated',
      description: 'Notification preferences have been saved successfully.',
    });
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure application settings and preferences</p>
        </div>
        
        <Tabs defaultValue="general">
          <div className="flex flex-col space-y-6 md:flex-row md:space-x-8 md:space-y-0">
            <div className="md:w-1/4">
              <TabsList className="flex flex-col h-auto space-y-1">
                <TabsTrigger value="general" className="justify-start w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="email" className="justify-start w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="security" className="justify-start w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="users" className="justify-start w-full">
                  <Users className="h-4 w-4 mr-2" />
                  User Settings
                </TabsTrigger>
                <TabsTrigger value="database" className="justify-start w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="tools" className="justify-start w-full">
                  <Wrench className="h-4 w-4 mr-2" />
                  Tools
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="md:w-3/4">
              <TabsContent value="general" className="mt-0">
                <Card>
                  <form onSubmit={handleGeneralSubmit}>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Manage basic application settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input 
                          id="siteName" 
                          value={generalSettings.siteName}
                          onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Input 
                          id="siteDescription" 
                          value={generalSettings.siteDescription}
                          onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail" 
                          type="email"
                          value={generalSettings.contactEmail}
                          onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="publicRegistration">Public Registration</Label>
                          <p className="text-sm text-muted-foreground">Allow users to register accounts</p>
                        </div>
                        <Switch 
                          id="publicRegistration"
                          checked={generalSettings.publicRegistration}
                          onCheckedChange={(checked) => setGeneralSettings({...generalSettings, publicRegistration: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">Make site unavailable for regular users</p>
                        </div>
                        <Switch 
                          id="maintenanceMode"
                          checked={generalSettings.maintenanceMode}
                          onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="bg-[#ea384c] hover:bg-red-700">Save Changes</Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="email" className="mt-0">
                <Card>
                  <form onSubmit={handleEmailSubmit}>
                    <CardHeader>
                      <CardTitle>Email Settings</CardTitle>
                      <CardDescription>Configure email server and delivery</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="emailProvider">Email Provider</Label>
                        <Input 
                          id="emailProvider" 
                          value={emailSettings.emailProvider}
                          onChange={(e) => setEmailSettings({...emailSettings, emailProvider: e.target.value})}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input 
                          id="smtpHost" 
                          value={emailSettings.smtpHost}
                          onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input 
                          id="smtpPort" 
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                        <Input 
                          id="smtpUsername" 
                          value={emailSettings.smtpUsername}
                          onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <Input 
                          id="smtpPassword"
                          type="password" 
                          value={emailSettings.smtpPassword}
                          onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="defaultFromEmail">Default From Email</Label>
                        <Input 
                          id="defaultFromEmail"
                          type="email" 
                          value={emailSettings.defaultFromEmail}
                          onChange={(e) => setEmailSettings({...emailSettings, defaultFromEmail: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defaultFromName">Default From Name</Label>
                        <Input 
                          id="defaultFromName" 
                          value={emailSettings.defaultFromName}
                          onChange={(e) => setEmailSettings({...emailSettings, defaultFromName: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <Button variant="outline" type="button">Test Email</Button>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="bg-[#ea384c] hover:bg-red-700">Save Changes</Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <Card>
                  <form onSubmit={handleSecuritySubmit}>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Configure security and authentication options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                          <p className="text-sm text-muted-foreground">Users must verify their email before accessing features</p>
                        </div>
                        <Switch 
                          id="requireEmailVerification"
                          checked={securitySettings.requireEmailVerification}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireEmailVerification: checked})}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                        <Input 
                          id="passwordMinLength"
                          type="number" 
                          value={securitySettings.passwordMinLength}
                          onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Password Requirements</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="passwordRequireUppercase"
                              checked={securitySettings.passwordRequireUppercase}
                              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireUppercase: checked as boolean})}
                            />
                            <label htmlFor="passwordRequireUppercase" className="text-sm">
                              Require uppercase letters
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="passwordRequireNumbers"
                              checked={securitySettings.passwordRequireNumbers}
                              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireNumbers: checked as boolean})}
                            />
                            <label htmlFor="passwordRequireNumbers" className="text-sm">
                              Require numbers
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="passwordRequireSymbols"
                              checked={securitySettings.passwordRequireSymbols}
                              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireSymbols: checked as boolean})}
                            />
                            <label htmlFor="passwordRequireSymbols" className="text-sm">
                              Require special characters
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
                        <Input 
                          id="sessionTimeout"
                          type="number" 
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                        <Input 
                          id="maxLoginAttempts"
                          type="number" 
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="bg-[#ea384c] hover:bg-red-700">Save Changes</Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <form onSubmit={handleNotificationSubmit}>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure which events trigger notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Admin Notifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="adminNewUser"
                              checked={notificationSettings.adminNewUser}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, adminNewUser: checked as boolean})}
                            />
                            <label htmlFor="adminNewUser" className="text-sm">
                              New user registration
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="adminNewPayment"
                              checked={notificationSettings.adminNewPayment}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, adminNewPayment: checked as boolean})}
                            />
                            <label htmlFor="adminNewPayment" className="text-sm">
                              New payment received
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="adminNewSupportTicket"
                              checked={notificationSettings.adminNewSupportTicket}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, adminNewSupportTicket: checked as boolean})}
                            />
                            <label htmlFor="adminNewSupportTicket" className="text-sm">
                              New support ticket
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">User Notifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="userWelcome"
                              checked={notificationSettings.userWelcome}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userWelcome: checked as boolean})}
                            />
                            <label htmlFor="userWelcome" className="text-sm">
                              Welcome email on registration
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="userPasswordReset"
                              checked={notificationSettings.userPasswordReset}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userPasswordReset: checked as boolean})}
                            />
                            <label htmlFor="userPasswordReset" className="text-sm">
                              Password reset requests
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="userPaymentConfirmation"
                              checked={notificationSettings.userPaymentConfirmation}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userPaymentConfirmation: checked as boolean})}
                            />
                            <label htmlFor="userPaymentConfirmation" className="text-sm">
                              Payment confirmations
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="userSupportTicketUpdate"
                              checked={notificationSettings.userSupportTicketUpdate}
                              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userSupportTicketUpdate: checked as boolean})}
                            />
                            <label htmlFor="userSupportTicketUpdate" className="text-sm">
                              Support ticket updates
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="bg-[#ea384c] hover:bg-red-700">Save Changes</Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>User Settings</CardTitle>
                    <CardDescription>Configure user-related options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">User settings section coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="database" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Settings</CardTitle>
                    <CardDescription>Manage database configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Database settings section coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tools" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>System Tools</CardTitle>
                    <CardDescription>Maintenance and utility tools</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="text-sm font-medium mb-2">Clear Cache</h3>
                        <p className="text-sm text-muted-foreground mb-4">Remove temporary files to free up space</p>
                        <Button variant="outline" className="w-full">Clear System Cache</Button>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <h3 className="text-sm font-medium mb-2">Backup Database</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create a backup of the current database</p>
                        <Button variant="outline" className="w-full">Create Backup</Button>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <h3 className="text-sm font-medium mb-2 text-red-500">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">These actions cannot be undone</p>
                        <div className="space-y-2">
                          <Button variant="destructive" className="w-full">Reset User Passwords</Button>
                          <Button variant="destructive" className="w-full">Purge Inactive Users</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
