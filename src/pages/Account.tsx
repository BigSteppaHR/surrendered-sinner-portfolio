
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Account = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [isAuthenticated, isLoading, profile, isInitialized]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
        })
        .eq('id', profile.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
        })
        .eq('id', profile.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message || "An error occurred while uploading your avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A1F2C] text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-gray-700">
                        <AvatarImage src={avatarUrl || ""} alt={fullName} />
                        <AvatarFallback className="bg-sinner-red/80 text-white text-xl">
                          {fullName ? getInitials(fullName) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-sinner-red rounded-full p-2 cursor-pointer border-2 border-gray-900"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                    </div>
                    <p className="text-sm text-gray-400">Click the camera icon to update your profile picture</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-gray-800 border-gray-700 opacity-70"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isUpdating || isUploading}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Password changes are managed through our secure password reset flow.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/reset-password")}
                >
                  Reset Password
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
