
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfilePhotoUploader from "@/components/account/ProfilePhotoUploader";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Account = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (profile) {
      setIsLoadingProfile(false);
      setEmail(profile.email || "");
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-[#111111] border-[#333333]">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription className="text-gray-400">
              Upload or take a new profile photo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isLoadingProfile ? (
              <div className="h-24 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#ea384c]" />
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
        
        <Card className="bg-[#111111] border-[#333333]">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription className="text-gray-400">
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProfile ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#ea384c]" />
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
                    className="bg-[#0a0a0a] border-[#333333] opacity-70"
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
                    className="bg-[#0a0a0a] border-[#333333]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#0a0a0a] border-[#333333]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto bg-[#ea384c] hover:bg-[#d32d3f]"
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
        
        <Card className="bg-[#111111] border-[#333333]">
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
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
