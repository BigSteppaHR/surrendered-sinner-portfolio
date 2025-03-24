
import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploaderProps {
  userId: string;
  currentAvatarUrl: string | null;
  onPhotoUploaded: (url: string) => void;
}

const ProfilePhotoUploader = ({ userId, currentAvatarUrl, onPhotoUploaded }: ProfilePhotoUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadFile(file);
  };

  // Handle camera capture
  const startCamera = async () => {
    setShowCameraOptions(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions and try again.",
        variant: "destructive"
      });
      setShowCameraOptions(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setShowCameraOptions(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame on the canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to file and upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
          await uploadFile(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  // Common upload function
  const uploadFile = async (file: File) => {
    if (!userId) return;
    
    setIsUploading(true);
    
    try {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file (JPG, PNG, etc.)');
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
      
      // Create a unique file name based on user ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the file
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      if (!data.publicUrl) throw new Error('Failed to get public URL for the uploaded file');
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Call the callback with the new URL
      onPhotoUploaded(data.publicUrl);
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been successfully updated"
      });
      
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col">
      {currentAvatarUrl && (
        <div className="mb-4 rounded-full overflow-hidden mx-auto w-24 h-24 border-2 border-[#9b87f5]">
          <img 
            src={currentAvatarUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {!showCameraOptions ? (
        <div className="flex flex-col space-y-2 items-center">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full md:w-auto"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Change Profile Photo
          </Button>
          
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full md:w-auto"
            onClick={startCamera}
            disabled={isUploading}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {isCameraActive && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={stopCamera}
            >
              Cancel
            </Button>
            
            <Button 
              type="button" 
              onClick={capturePhoto}
              disabled={!isCameraActive}
            >
              Capture
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUploader;
