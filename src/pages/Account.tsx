
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
import { Camera, Loader2, Save, Mail, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email")
});

const Account = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: ""
    },
  });
  
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
      
      form.reset({
        fullName: profile.full_name || "",
        email: profile.email || ""
      });
    }
  }, [isAuthenticated, isLoading, profile, isInitialized, form]);

  const handleUpdateProfile = async (data: z.infer<typeof profileSchema>) => {
    if (!profile?.id) return;
    
    setIsUpdating(true);
    
    try {
      // Only update if changes were made
      if (data.fullName !== profile.full_name) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
          })
          .eq('id', profile.id);
          
        if (error) {
          throw error;
        }
      }
      
      // Only update email if it has changed
      if (data.email !== profile.email) {
        setIsUpdatingEmail(true);
        
        const { error } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (error) {
          throw error;
        }
        
        // Update the profile table as well
        await supabase
          .from('profiles')
          .update({
            email: data.email,
            email_confirmed: false // Reset confirmation status
          })
          .eq('id', profile.id);
          
        toast({
          title: "Email update initiated",
          description: "Please check your new email address for a confirmation link",
        });
      }
      
      // Refresh the profile data
      await refreshProfile();
      
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
      setIsUpdatingEmail(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !acceptedTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, WEBP)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create a unique filename
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
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
      
      // Refresh the profile
      await refreshProfile();
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      
      // Check for storage bucket not found error
      if (error.message?.includes('bucket not found')) {
        toast({
          title: "Storage not configured",
          description: "Please contact support to enable profile pictures",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error uploading avatar",
          description: error.message || "An error occurred while uploading your avatar",
          variant: "destructive",
        });
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-sinner-red/50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 to-sinner-red/30 text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">Account Settings</h1>
            <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-sinner-red" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-6">
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
                        className="absolute bottom-0 right-0 bg-sinner-red rounded-full p-2 cursor-pointer border-2 border-gray-900 hover:bg-red-700 transition-colors"
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
                        {...form.register("fullName")}
                        className="bg-gray-800 border-gray-700"
                      />
                      {form.formState.errors.fullName && (
                        <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          {...form.register("email")}
                          className="bg-gray-800 border-gray-700 pl-10"
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Changing your email will require verification of the new address
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                    disabled={isUpdating || isUploading}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Update your password using our secure password reset system
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
