import { useState, useEffect } from "react";
import { Settings, Save, Plus, Trash, Filter, RefreshCw, Key, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StripeProvider from "@/components/StripeProvider";

type SystemSetting = {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    description: "",
    isPublic: false
  });
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [showHiddenValues, setShowHiddenValues] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("setting_key");
      
      if (error) throw error;
      
      setSettings(data || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const filteredSettings = settings.filter(setting => 
    setting.setting_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (setting.description && setting.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddOrUpdateSetting = async () => {
    try {
      // Validate JSON format
      try {
        JSON.parse(newSetting.value);
        setIsJsonValid(true);
      } catch (e) {
        setIsJsonValid(false);
        toast({
          title: "Invalid JSON",
          description: "The value must be a valid JSON object or value",
          variant: "destructive"
        });
        return;
      }
      
      if (!newSetting.key.trim()) {
        toast({
          title: "Error",
          description: "Setting key is required",
          variant: "destructive"
        });
        return;
      }
      
      const settingData = {
        setting_key: newSetting.key,
        setting_value: JSON.parse(newSetting.value),
        description: newSetting.description || null,
        is_public: newSetting.isPublic
      };
      
      if (editingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from("system_settings")
          .update(settingData)
          .eq("id", editingSetting.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Setting updated successfully"
        });
      } else {
        // Create new setting
        const { error } = await supabase
          .from("system_settings")
          .insert(settingData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Setting created successfully"
        });
      }
      
      // Reset form and close dialog
      setNewSetting({
        key: "",
        value: "",
        description: "",
        isPublic: false
      });
      setEditingSetting(null);
      setIsAddDialogOpen(false);
      
      // Refresh settings list
      fetchSettings();
    } catch (error) {
      console.error("Error saving setting:", error);
      toast({
        title: "Error",
        description: "Failed to save setting",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("system_settings")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setSettings(settings.filter(setting => setting.id !== id));
      
      toast({
        title: "Success",
        description: "Setting deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting setting:", error);
      toast({
        title: "Error",
        description: "Failed to delete setting",
        variant: "destructive"
      });
    }
  };

  const handleEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setNewSetting({
      key: setting.setting_key,
      value: JSON.stringify(setting.setting_value, null, 2),
      description: setting.description || "",
      isPublic: setting.is_public
    });
    setIsAddDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleShowValue = (id: string) => {
    setShowHiddenValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isSecretKey = (key: string) => {
    return key.toLowerCase().includes("key") || 
           key.toLowerCase().includes("secret") || 
           key.toLowerCase().includes("password") ||
           key.toLowerCase().includes("token");
  };

  const renderSettingValue = (setting: SystemSetting) => {
    const isSensitive = isSecretKey(setting.setting_key);
    const shouldShow = showHiddenValues[setting.id] || !isSensitive;
    
    if (isSensitive && !shouldShow) {
      return "••••••••••••••••";
    }
    
    // Handle different value types
    if (typeof setting.setting_value === 'object') {
      return JSON.stringify(setting.setting_value);
    }
    
    return String(setting.setting_value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <Badge variant="outline" className="bg-sinner-red/10 text-sinner-red border-sinner-red/20">
          Admin Portal
        </Badge>
      </div>

      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 text-sinner-red mr-2" />
            Configuration Settings
          </CardTitle>
          <CardDescription>
            Manage system-wide configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => {
                    setEditingSetting(null);
                    setNewSetting({
                      key: "",
                      value: "",
                      description: "",
                      isPublic: false
                    });
                    setIsAddDialogOpen(true);
                  }}
                  className="bg-sinner-red hover:bg-sinner-red/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Setting
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchSettings}
                  className="border-[#333333]"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-[#1A1A1A] border-[#333333]"
                />
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <RefreshCw className="h-10 w-10 animate-spin text-sinner-red" />
              </div>
            ) : filteredSettings.length > 0 ? (
              <div className="border rounded-md border-[#333333]">
                <Table>
                  <TableHeader className="bg-[#1A1A1A]">
                    <TableRow className="border-[#333333] hover:bg-[#1A1A1A]">
                      <TableHead className="text-white">Key</TableHead>
                      <TableHead className="text-white">Value</TableHead>
                      <TableHead className="text-white">Description</TableHead>
                      <TableHead className="text-white">Public</TableHead>
                      <TableHead className="text-white">Updated</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSettings.map((setting) => (
                      <TableRow key={setting.id} className="border-[#333333] hover:bg-[#1A1A1A]">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Key className="h-4 w-4 mr-2 text-sinner-red" />
                            {setting.setting_key}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="max-w-xs truncate">
                              {renderSettingValue(setting)}
                            </span>
                            {isSecretKey(setting.setting_key) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleShowValue(setting.id)}
                                className="ml-1 h-6 w-6"
                              >
                                {showHiddenValues[setting.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{setting.description || "-"}</TableCell>
                        <TableCell>
                          {setting.is_public ? (
                            <Badge className="bg-green-500/20 text-green-500">Yes</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(setting.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSetting(setting)}
                              className="h-8 border-[#333333] text-gray-400 hover:text-white"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSetting(setting.id)}
                              className="h-8 text-gray-400 hover:text-sinner-red"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60">
                <Settings className="h-10 w-10 text-gray-500 mb-2" />
                <h3 className="text-lg font-medium">No settings found</h3>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "No settings match your search criteria"
                    : "There are no system settings yet. Click 'Add Setting' to create one."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Setting Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingSetting ? "Edit Setting" : "Add New Setting"}
            </DialogTitle>
            <DialogDescription>
              {editingSetting 
                ? "Modify the existing system setting" 
                : "Add a new system-wide configuration setting"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">
                Key
              </Label>
              <Input
                id="key"
                value={newSetting.key}
                onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                className="col-span-3 bg-[#1A1A1A] border-[#333333]"
                disabled={!!editingSetting}
                placeholder="e.g., stripe.publishable_key"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="value" className="text-right pt-2">
                Value (JSON)
              </Label>
              <Textarea
                id="value"
                value={newSetting.value}
                onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                className={`col-span-3 font-mono text-sm h-32 bg-[#1A1A1A] border-[#333333] ${
                  !isJsonValid ? "border-red-500" : ""
                }`}
                placeholder='e.g., "pk_test_example123" or {"key": "value"}'
              />
            </div>
            {!isJsonValid && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1"></div>
                <div className="col-span-3 text-red-500 text-sm">
                  Must be valid JSON. Remember to use double quotes for strings and keys.
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newSetting.description}
                onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                className="col-span-3 bg-[#1A1A1A] border-[#333333]"
                placeholder="Optional description of this setting"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="isPublic" className="text-right">
                  Public
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isPublic"
                  checked={newSetting.isPublic}
                  onCheckedChange={(checked) => 
                    setNewSetting({...newSetting, isPublic: checked})
                  }
                />
                <Label htmlFor="isPublic">
                  Make visible to unauthenticated users
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsJsonValid(true);
              }}
              className="border-[#333333]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddOrUpdateSetting}
              className="bg-sinner-red hover:bg-sinner-red/80"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingSetting ? "Update Setting" : "Save Setting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
