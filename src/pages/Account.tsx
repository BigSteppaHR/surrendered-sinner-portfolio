
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfilePhotoUploader from "@/components/account/ProfilePhotoUploader";
import { Loader2 } from "lucide-react";

const Account = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    
    if (profile) {
      setIsLoadingProfile(false);
      setEmail(profile.email || "");
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, isAuthenticated, isLoading, isInitialized]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      // Refresh profile data
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUploaded = (url: string) => {
    setAvatarUrl(url);
    refreshProfile();
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
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Account Settings</h1>
            <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload or take a new profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {isLoadingProfile ? (
                  <div className="h-24 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <ProfilePhotoUploader 
                    userId={profile?.id || ""}
                    currentAvatarUrl={avatarUrl}
                    onPhotoUploaded={handlePhotoUploaded}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <div className="h-32 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-800 border-gray-700 opacity-70"
                      />
                      <p className="text-xs text-gray-500">Email address cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto bg-[#9b87f5] hover:bg-[#8a76e4]"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : "Save Changes"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full md:w-auto"
                  onClick={() => navigate("/reset-password")}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
