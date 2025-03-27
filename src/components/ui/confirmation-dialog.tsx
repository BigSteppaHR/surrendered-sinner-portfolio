
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, Dumbbell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  icon,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gradient-to-b from-gray-900 to-black border border-sinner-red/30 shadow-[0_0_15px_rgba(234,56,76,0.3)] animate-[scale-in_0.25s_ease-out]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(234,56,76,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-black rounded-full border-2 border-sinner-red shadow-[0_0_15px_rgba(234,56,76,0.5)]" />
          {icon || (
            <Dumbbell size={32} className="text-sinner-red relative z-10 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
          )}
        </div>
        
        <AlertDialogHeader className="pt-4">
          <div className="flex items-center justify-center mb-1">
            <Sparkles size={16} className="text-sinner-red mr-2" />
            <AlertDialogTitle className="text-white text-xl font-bold">{title}</AlertDialogTitle>
            <Sparkles size={16} className="text-sinner-red ml-2" />
          </div>
          <AlertDialogDescription className="text-gray-300 text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-2 px-2">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sinner-red/30 to-transparent" />
        </div>
        
        <AlertDialogFooter className="sm:space-x-4">
          <AlertDialogCancel 
            className={cn(
              "transition-all duration-200 border-gray-700 text-white bg-black hover:bg-gray-800",
              "hover:shadow-[0_0_10px_rgba(234,56,76,0.15)] hover:border-sinner-red/30"
            )}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "bg-sinner-red hover:bg-red-700 text-white transition-all duration-200",
              "shadow-[0_0_10px_rgba(234,56,76,0.3)] hover:shadow-[0_0_15px_rgba(234,56,76,0.5)]",
              "flex items-center gap-2"
            )}
          >
            <Zap size={16} className="animate-pulse" />
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
