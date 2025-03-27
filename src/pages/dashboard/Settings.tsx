
import React, { useState } from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sliders, Moon, Sun, Globe, Palette, MonitorSmartphone, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [debugMode, setDebugMode] = useState(profile?.debug_mode || false);
  
  const handleToggleDebugMode = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const newDebugMode = !debugMode;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          debug_mode: newDebugMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setDebugMode(newDebugMode);
      toast({
        title: `Debug Mode ${newDebugMode ? 'Enabled' : 'Disabled'}`,
        description: newDebugMode 
          ? 'Debug information will now be displayed in the application.' 
          : 'Debug information will no longer be displayed.',
      });
    } catch (error) {
      console.error('Error updating debug mode:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAppearance = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your appearance settings have been updated',
    });
  };
  
  const handleExportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch user data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch user's workout plans
      const { data: plansData, error: plansError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id);
      
      if (plansError) throw plansError;
      
      // Fetch user's weight records
      const { data: weightsData, error: weightsError } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id);
      
      if (weightsError) throw weightsError;
      
      // Compile all data
      const exportData = {
        profile: profileData,
        workoutPlans: plansData,
        weightRecords: weightsData,
        exportDate: new Date().toISOString()
      };
      
      // Create and download the JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `fitness_data_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: 'Data Exported',
        description: 'Your data has been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'There was a problem exporting your data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Customize your application preferences</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 text-sinner-red mr-2" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how the application looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 rounded-lg cursor-pointer border ${theme === 'dark' ? 'border-sinner-red' : 'border-zinc-700'}`}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Moon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>Dark</span>
                          </div>
                          {theme === 'dark' && (
                            <div className="h-3 w-3 rounded-full bg-sinner-red"></div>
                          )}
                        </div>
                        <div className="h-24 bg-zinc-800 rounded-md border border-zinc-700"></div>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg cursor-pointer border ${theme === 'light' ? 'border-sinner-red' : 'border-zinc-700'}`}
                        onClick={() => setTheme('light')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Sun className="h-5 w-5 mr-2 text-gray-400" />
                            <span>Light</span>
                          </div>
                          {theme === 'light' && (
                            <div className="h-3 w-3 rounded-full bg-sinner-red"></div>
                          )}
                        </div>
                        <div className="h-24 bg-white rounded-md border border-gray-300"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Text Size</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Accessibility</h3>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Reduce Motion</Label>
                          <p className="text-sm text-gray-400">Minimize animations</p>
                        </div>
                        <Switch 
                          checked={reduceMotion}
                          onCheckedChange={setReduceMotion}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">High Contrast</Label>
                          <p className="text-sm text-gray-400">Increase color contrast</p>
                        </div>
                        <Switch 
                          checked={highContrast}
                          onCheckedChange={setHighContrast}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleSaveAppearance}
                    className="bg-sinner-red hover:bg-red-700"
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 text-sinner-red mr-2" />
                    Language & Region
                  </CardTitle>
                  <CardDescription>Change your language and regional preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-sinner-red hover:bg-red-700">
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="col-span-1 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sliders className="h-5 w-5 text-sinner-red mr-2" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>Customize advanced application options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Debug Mode</Label>
                        <p className="text-sm text-gray-400">Show additional debugging information</p>
                      </div>
                      <Switch 
                        checked={debugMode}
                        onCheckedChange={handleToggleDebugMode}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Cache Workout Data</Label>
                        <p className="text-sm text-gray-400">Store workout data for offline access</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MonitorSmartphone className="h-5 w-5 text-sinner-red mr-2" />
                    Device Management
                  </CardTitle>
                  <CardDescription>Manage devices connected to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Current Device</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {navigator.userAgent.split('/')[0]}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400">
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export or delete your personal data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-zinc-700 text-white"
                    onClick={handleExportData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : 'Export Your Data'}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full bg-red-800 hover:bg-red-700"
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
